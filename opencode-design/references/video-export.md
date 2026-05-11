# Video Export · HTML Animation → MP4 / GIF / with BGM

The default delivery for an animation HTML is a **MP4 with audio**, not silent footage. A silent version is half-finished — the user feels "things move but don't respond" and that's where cheap-feeling outputs come from.

This file documents the 3-step pipeline. Skip audio ONLY when the user explicitly says "silent" / "I'll dub it".

---

## Pipeline overview

```
HTML animation
    │
    ▼ scripts/render-video.js
25fps silent MP4 (intermediate, NOT delivery)
    │
    ▼ scripts/convert-formats.sh
60fps interpolated MP4 + palette-optimized GIF
    │
    ▼ scripts/add-music.sh
Final MP4 with BGM + (optional) SFX track
```

---

## Step 1 · Record (HTML → silent MP4)

Use `scripts/render-video.js` (Playwright-based recorder). The recorder:

1. Opens the animation HTML in headless Chromium
2. Waits for `window.__ready === true`
3. Forces `Stage.loop = false` via setting `window.__recording = true`
4. Captures a frame every 40ms (25fps)
5. Pipes frames to ffmpeg → MP4

```bash
node scripts/render-video.js \
  --input animation.html \
  --output _temp/silent.mp4 \
  --duration 10000 \
  --fps 25 \
  --resolution 1920x1080
```

**Required HTML setup** (covered in `references/animation-pitfalls.md`):
- Set `window.__ready = true` in first time-tick (NOT in `useEffect`)
- Stage detects `window.__recording === true` to switch off loop
- All images and fonts preloaded before ready signal

---

## Step 2 · Convert (25fps → 60fps + GIF)

`scripts/convert-formats.sh` runs ffmpeg with frame interpolation (`minterpolate`) to get smooth 60fps for output, plus produces a palette-optimized GIF for platforms that don't support MP4 inline (e.g. GitHub READMEs).

```bash
bash scripts/convert-formats.sh _temp/silent.mp4 output/
# Produces:
# output/animation_60fps.mp4
# output/animation.gif
```

Key ffmpeg flags inside the script:

```bash
# 60fps interpolation
ffmpeg -i input.mp4 \
  -vf "minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:vsbmf=1" \
  -c:v libx264 -crf 18 -preset slow \
  output_60fps.mp4

# Palette-optimized GIF (massively smaller files)
ffmpeg -i input.mp4 -vf "fps=24,scale=1280:-1:flags=lanczos,palettegen" -y palette.png
ffmpeg -i input.mp4 -i palette.png -filter_complex \
  "fps=24,scale=1280:-1:flags=lanczos[x];[x][1:v]paletteuse" \
  output.gif
```

**Output size guidance**:
- MP4 60fps 1920×1080 10s: 8-15MB
- GIF 24fps 1280×720 10s: 3-8MB
- For social platforms with strict limits, downscale GIF to 720p

---

## Step 3 · Add music (silent MP4 → MP4 with BGM)

`scripts/add-music.sh` mixes BGM + SFX into the final MP4. BGM library (in `assets/bgm/` if installed):

| Filename | Mood | Use |
|---|---|---|
| `bgm-tech.mp3` | Field.io / generative tech | Product demos, AI launches |
| `bgm-ad.mp3` | Energetic, brand film | Launch announcements |
| `bgm-educational.mp3` | Calm, exploratory | Tutorials, walkthroughs |
| `bgm-tutorial.mp3` | Friendly, mid-tempo | How-to content |
| `bgm-tech-alt.mp3` | Tech but more contemplative | Architecture / deep dives |
| `bgm-ad-alt.mp3` | Brand film, more cinematic | High-end launches |

Pick by matching the animation's emotional tone — see `references/audio-design-rules.md` for full pairing logic.

```bash
bash scripts/add-music.sh \
  --input output/animation_60fps.mp4 \
  --bgm assets/bgm/bgm-tech.mp3 \
  --output output/animation_final.mp4 \
  --bgm-volume 0.45 \
  --fade-in 1.5 \
  --fade-out 2.0
```

**Volume guidelines**:
- BGM alone (no SFX): 0.5-0.7
- BGM + SFX: BGM at 0.3-0.45, SFX at 0.7-0.9
- Voice-over track: BGM at 0.15-0.25, voice at 1.0

---

## SFX layer (optional but recommended)

For "Apple-keynote-quality" animations, BGM alone isn't enough. SFX cues at key moments make the animation feel premium.

See `references/audio-design-rules.md` for:

- 37-asset prebuilt SFX library by category
- Density recipes (launch hero ≈ 6 cues per 10s, tool demo ≈ 0-2 per 10s)
- ffmpeg multi-track mixing template
- Frequency separation (SFX high-frequency, BGM low-frequency)

Quick recipe for a launch-style 10s animation:

```
0.0s  whoosh-in        (intro)
1.5s  click            (product reveal)
3.0s  metallic-tap     (detail focus)
5.0s  swell-rise       (transition to second beat)
7.5s  click            (second product reveal)
9.5s  whoosh-out       (closer)
```

---

## Pre-delivery checklist

Before delivering the final MP4:

- [ ] `ffprobe -select_streams a output.mp4` confirms audio stream exists
- [ ] Total duration matches the animation's intended length
- [ ] Resolution matches output spec (1920×1080 unless stated otherwise)
- [ ] First-frame is intentional (not a flash of black)
- [ ] Last-frame is intentional (not cut mid-motion)
- [ ] Audio fade-in / fade-out smooth (no abrupt start/end)
- [ ] File size reasonable (<20MB for 10s 60fps 1080p)
- [ ] GIF version produced if requested
- [ ] Both versions playable in QuickTime / VLC / browser

---

## Common pipeline failures

| Symptom | Cause |
|---|---|
| Recorded MP4 has frame 0 missing | `window.__ready` set in useEffect not first tick |
| Recording stutters at end | Stage `loop=true` not switched off |
| 60fps output looks the same as 25fps input | `minterpolate` filter wasn't applied |
| GIF file >50MB | Skipped palette generation step |
| BGM clips at end | No fade-out applied |
| BGM louder than SFX | Volume balance reversed |
| Audio out of sync with video | Different sample rates between BGM and video container |
| ffprobe shows no audio stream | `add-music.sh` failed silently — check ffmpeg version |

---

## Watermark policy

Per SKILL.md, animations only (not slides / infographics / prototypes) include a "Created with opencode-design" watermark by default in the bottom-right corner. This is for skill propagation as the MP4/GIF circulates on social platforms.

```jsx
<div style={{
  position: 'absolute', bottom: 24, right: 32,
  fontSize: 11, color: 'rgba(0,0,0,0.4)',  // dark bg: 'rgba(255,255,255,0.35)'
  letterSpacing: '0.15em', fontFamily: 'monospace',
  pointerEvents: 'none', zIndex: 100,
}}>
  Made with opencode-design
</div>
```

For third-party brand animations (e.g. an unofficial tribute to brand X), prefix with "Unofficial · " to avoid IP confusion.

If the user explicitly says "no watermark" — respect, remove.

---

## Platform-specific export tips

| Platform | Format | Resolution | Duration limits |
|---|---|---|---|
| Twitter/X | MP4 H.264 | 1920×1080 max | 2:20 max |
| LinkedIn | MP4 H.264 | 1920×1080 | 10 min max |
| Instagram feed | MP4, square or 4:5 | 1080×1080 or 1080×1350 | 60s |
| Instagram Reels | MP4, 9:16 | 1080×1920 | 90s |
| TikTok | MP4, 9:16 | 1080×1920 | 3 min |
| YouTube Shorts | MP4, 9:16 | 1080×1920 | 60s |
| GitHub README | GIF preferred | 1280×720 | <10MB |
| Slack | MP4 or GIF | 1080p | <8MB inline |

For 9:16 vertical: render at 1080×1920 from the start — don't crop a 16:9.

---

## Quick start (one-liner for the impatient)

```bash
# Full pipeline: HTML → final MP4 with BGM
node scripts/render-video.js --input anim.html --output _temp/raw.mp4 --duration 10000 \
  && bash scripts/convert-formats.sh _temp/raw.mp4 _temp/ \
  && bash scripts/add-music.sh --input _temp/raw_60fps.mp4 --bgm assets/bgm/bgm-tech.mp3 --output final.mp4
```

If you have SFX cues, fold them in before BGM mixing — see audio-design-rules.md.
