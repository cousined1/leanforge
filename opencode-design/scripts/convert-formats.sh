#!/usr/bin/env bash
# scripts/convert-formats.sh
# Take a 25fps MP4 from render-video.js and produce:
#   • <name>_60.mp4   — 60fps via motion-interpolation (smooth playback)
#   • <name>.gif      — palette-optimized GIF (good for README/Slack)
#   • <name>.webm     — VP9 webm (smaller, for web embeds)  [optional]
#
# Usage:
#   ./convert-formats.sh input.mp4 [--gif-width 720] [--no-webm]
#
# Why 60fps interpolation instead of recording at 60fps?
#   Recording at 60fps doubles render time and disk I/O for marginal
#   visual gain. Interpolating from a clean 25fps source with minterpolate
#   gives playback that looks ~as good as native 60 on most content,
#   without paying the recording cost.
#
# Requirements: ffmpeg ≥ 4.4 (for minterpolate=mi_mode=mci).

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "usage: $0 input.mp4 [--gif-width N] [--no-webm]" >&2
  exit 2
fi

INPUT="$1"; shift
GIF_WIDTH=720
MAKE_WEBM=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --gif-width) GIF_WIDTH="$2"; shift 2 ;;
    --no-webm)   MAKE_WEBM=0; shift ;;
    *) echo "unknown flag: $1" >&2; exit 2 ;;
  esac
done

if [[ ! -f "$INPUT" ]]; then
  echo "✗ input not found: $INPUT" >&2
  exit 1
fi

BASE="${INPUT%.*}"
MP4_60="${BASE}_60.mp4"
GIF="${BASE}.gif"
WEBM="${BASE}.webm"
PALETTE="$(mktemp -t palette.XXXXXX.png)"
trap 'rm -f "$PALETTE"' EXIT

echo "▶ ${INPUT}"

# 1. 60fps interpolation
echo "  → ${MP4_60}  (60fps motion interpolation)"
ffmpeg -hide_banner -loglevel error -y -i "$INPUT" \
  -vf "minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:vsbmf=1" \
  -c:v libx264 -pix_fmt yuv420p -crf 18 -preset slow \
  -movflags +faststart \
  "$MP4_60"

# 2. Palette GIF (two-pass for clean colors)
echo "  → ${GIF}       (palette GIF @ ${GIF_WIDTH}px)"
ffmpeg -hide_banner -loglevel error -y -i "$INPUT" \
  -vf "fps=15,scale=${GIF_WIDTH}:-1:flags=lanczos,palettegen=stats_mode=diff" \
  "$PALETTE"
ffmpeg -hide_banner -loglevel error -y -i "$INPUT" -i "$PALETTE" \
  -filter_complex "fps=15,scale=${GIF_WIDTH}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=5" \
  "$GIF"

# 3. WebM (optional)
if [[ "$MAKE_WEBM" == "1" ]]; then
  echo "  → ${WEBM}     (VP9)"
  ffmpeg -hide_banner -loglevel error -y -i "$INPUT" \
    -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 -tile-columns 2 \
    -an "$WEBM"
fi

echo "✓ done"
ls -lh "$MP4_60" "$GIF" $([[ "$MAKE_WEBM" == "1" ]] && echo "$WEBM") | awk '{print "  " $9 "  " $5}'
