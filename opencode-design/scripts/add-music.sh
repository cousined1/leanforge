#!/usr/bin/env bash
# scripts/add-music.sh
# Mix a BGM track (and optional SFX) into a video.
#
# Usage:
#   ./add-music.sh <input.mp4> <bgm.mp3> [--volume 0.3] [--fade 1.0]
#                                         [--sfx file.wav:start_sec[:vol]]...
#                                         [--out result.mp4]
#
# Examples:
#   # BGM only at default volume
#   ./add-music.sh demo_60.mp4 ../assets/bgm/cinema_pad.mp3
#
#   # BGM + a click at 1.2s and a whoosh at 3.5s
#   ./add-music.sh demo_60.mp4 bgm.mp3 \
#       --sfx ../assets/sfx/click.wav:1.2:0.6 \
#       --sfx ../assets/sfx/whoosh.wav:3.5:0.8
#
# Defaults:
#   BGM volume:   0.30  (low — the visual leads, music supports)
#   Fade in/out:  1.0s  (smooth start and end)
#   BGM is trimmed to video duration; longer BGM is cut, shorter is looped.
#
# Requirements: ffmpeg.

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "usage: $0 <input.mp4> <bgm.mp3|wav|m4a> [options]" >&2
  echo "       --volume FLOAT       BGM volume 0.0-1.0 (default 0.30)" >&2
  echo "       --fade SEC           fade in/out duration (default 1.0)" >&2
  echo "       --sfx FILE:START[:V] add SFX at START seconds, optional vol" >&2
  echo "       --out PATH           output path (default <input>_audio.mp4)" >&2
  exit 2
fi

INPUT="$1"; shift
BGM="$1"; shift

VOL="0.30"
FADE="1.0"
SFX_LIST=()
OUT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --volume) VOL="$2"; shift 2 ;;
    --fade)   FADE="$2"; shift 2 ;;
    --sfx)    SFX_LIST+=("$2"); shift 2 ;;
    --out)    OUT="$2"; shift 2 ;;
    *) echo "unknown flag: $1" >&2; exit 2 ;;
  esac
done

[[ -f "$INPUT" ]] || { echo "✗ input not found: $INPUT" >&2; exit 1; }
[[ -f "$BGM" ]]   || { echo "✗ bgm not found: $BGM" >&2; exit 1; }

OUT="${OUT:-${INPUT%.*}_audio.mp4}"

# Probe video duration
DUR="$(ffprobe -v error -select_streams v:0 -show_entries format=duration -of csv=p=0 "$INPUT")"
DUR_INT="$(printf '%.0f' "$DUR")"
FADE_OUT_START="$(awk "BEGIN { printf \"%.2f\", $DUR - $FADE }")"

echo "▶ ${INPUT}  (${DUR}s)  +  $(basename "$BGM")  vol=${VOL}  fade=${FADE}s"
[[ ${#SFX_LIST[@]} -gt 0 ]] && echo "  + ${#SFX_LIST[@]} SFX layer(s)"

# Build ffmpeg input list and filter chain.
INPUTS=(-i "$INPUT" -stream_loop -1 -i "$BGM")
# Index 0 = video, index 1 = BGM. SFX start at 2.
for entry in "${SFX_LIST[@]}"; do
  IFS=':' read -r f _start _v <<< "$entry"
  INPUTS+=(-i "$f")
done

# BGM filter: trim to video length, volume, fades
BGM_FILTER="[1:a]atrim=0:${DUR},asetpts=N/SR/TB,volume=${VOL},afade=t=in:st=0:d=${FADE},afade=t=out:st=${FADE_OUT_START}:d=${FADE}[bgm]"

# SFX filters
SFX_FILTERS=""
SFX_LABELS=()
idx=2
for entry in "${SFX_LIST[@]}"; do
  IFS=':' read -r _file start vol <<< "$entry"
  vol="${vol:-0.7}"
  delay_ms="$(awk "BEGIN { printf \"%d\", $start * 1000 }")"
  SFX_FILTERS+="[${idx}:a]volume=${vol},adelay=${delay_ms}|${delay_ms}[sfx${idx}];"
  SFX_LABELS+=("[sfx${idx}]")
  idx=$((idx + 1))
done

# Mix everything together
if [[ ${#SFX_LABELS[@]} -gt 0 ]]; then
  MIX_INPUTS="[bgm]${SFX_LABELS[*]}"
  N=$((1 + ${#SFX_LABELS[@]}))
  MIX_INPUTS_NOSPACE="$(echo "$MIX_INPUTS" | tr -d ' ')"
  FILTER="${BGM_FILTER};${SFX_FILTERS}${MIX_INPUTS_NOSPACE}amix=inputs=${N}:duration=longest:dropout_transition=0[aout]"
else
  FILTER="${BGM_FILTER};[bgm]anull[aout]"
fi

ffmpeg -hide_banner -loglevel error -y "${INPUTS[@]}" \
  -filter_complex "$FILTER" \
  -map 0:v -map "[aout]" \
  -c:v copy -c:a aac -b:a 192k -shortest \
  "$OUT"

SIZE="$(ls -lh "$OUT" | awk '{print $5}')"
echo "✓ ${OUT}  (${SIZE})"
