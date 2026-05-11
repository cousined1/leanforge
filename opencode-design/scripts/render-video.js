#!/usr/bin/env node
// scripts/render-video.js
// Record an HTML animation file to MP4 at 25fps.
//
// Usage:
//   node render-video.js <input.html> [options]
//
// Options:
//   --duration N        seconds to record (default: read from <Stage duration> via window.__stageDuration)
//   --fps N             frames per second (default: 25; convert-formats.sh upsamples to 60)
//   --width N           viewport width (default: 1920)
//   --height N          viewport height (default: 1080)
//   --output path       output mp4 path (default: <input>.mp4)
//   --quality N         CRF 0-51, lower = better (default: 18)
//   --headed            show the browser window (debugging)
//
// How it works:
//   1. Launch Chromium with --hide-scrollbars, set viewport.
//   2. Set window.__recording = true BEFORE navigating, so Stage knows
//      to disable loop, hide chrome, and use deterministic time.
//   3. Navigate to file://<input>, wait for window.__ready === true.
//      (Stage sets __ready on the first render tick, NOT in useEffect.)
//   4. For each frame f in [0, duration*fps):
//        set window.__frame = f / fps   // seconds, deterministic
//        screenshot to PNG
//   5. Pipe PNG sequence into ffmpeg → MP4 (h264, yuv420p, CRF 18).
//
// Why not video recording API? Because:
//   • HTML video capture is non-deterministic (drops frames under load).
//   • We need bit-exact reproducibility for diffs and re-renders.
//   • This produces broadcast-clean frames with no compositing artifacts.
//
// Requirements: node ≥ 18, playwright (npm i -D playwright), ffmpeg in PATH.
// First run: `npx playwright install chromium`

const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

function parseArgs(argv) {
  const args = { fps: 25, width: 1920, height: 1080, quality: 18, headed: false };
  const positional = [];
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--duration") args.duration = parseFloat(argv[++i]);
    else if (a === "--fps") args.fps = parseInt(argv[++i], 10);
    else if (a === "--width") args.width = parseInt(argv[++i], 10);
    else if (a === "--height") args.height = parseInt(argv[++i], 10);
    else if (a === "--output") args.output = argv[++i];
    else if (a === "--quality") args.quality = parseInt(argv[++i], 10);
    else if (a === "--headed") args.headed = true;
    else if (a.startsWith("--")) { console.error(`unknown flag: ${a}`); process.exit(2); }
    else positional.push(a);
  }
  if (positional.length !== 1) {
    console.error("usage: node render-video.js <input.html> [options]");
    process.exit(2);
  }
  args.input = path.resolve(positional[0]);
  if (!fs.existsSync(args.input)) {
    console.error(`input not found: ${args.input}`);
    process.exit(1);
  }
  args.output = args.output || args.input.replace(/\.html?$/i, "") + ".mp4";
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  console.log(`▶ recording ${path.basename(args.input)} → ${path.basename(args.output)}`);
  console.log(`  ${args.width}×${args.height} @ ${args.fps}fps · CRF ${args.quality}`);

  const browser = await chromium.launch({ headless: !args.headed, args: ["--hide-scrollbars"] });
  const context = await browser.newContext({
    viewport: { width: args.width, height: args.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // Inject recording flag BEFORE any page script runs.
  await page.addInitScript(() => {
    window.__recording = true;
    window.__frame = 0;
  });

  await page.goto("file://" + args.input, { waitUntil: "networkidle" });

  // Wait for Stage to signal ready. Timeout after 30s.
  await page.waitForFunction(() => window.__ready === true, { timeout: 30000 })
    .catch(() => { throw new Error("window.__ready never became true. Did Stage set it on first tick? See animation-pitfalls.md rule #4."); });

  // Resolve duration
  let duration = args.duration;
  if (!duration) {
    duration = await page.evaluate(() => window.__stageDuration || 0);
  }
  if (!duration || duration <= 0) {
    throw new Error("duration unknown. Pass --duration N or set window.__stageDuration in your Stage component.");
  }
  const totalFrames = Math.round(duration * args.fps);
  console.log(`  ${duration}s · ${totalFrames} frames`);

  // Spawn ffmpeg, piping PNG sequence on stdin.
  const ffmpegArgs = [
    "-y",
    "-f", "image2pipe",
    "-framerate", String(args.fps),
    "-i", "-",
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-crf", String(args.quality),
    "-preset", "slow",
    "-movflags", "+faststart",
    args.output,
  ];
  const ff = spawn("ffmpeg", ffmpegArgs, { stdio: ["pipe", "ignore", "inherit"] });
  ff.on("error", (e) => { throw new Error(`ffmpeg spawn failed: ${e.message}. Is ffmpeg installed and on PATH?`); });

  const t0 = Date.now();
  for (let f = 0; f < totalFrames; f++) {
    await page.evaluate((frame) => { window.__frame = frame; }, f / args.fps);
    // One animation frame to let React re-render with new __frame value.
    await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    const buf = await page.screenshot({ type: "png", omitBackground: false });
    if (!ff.stdin.write(buf)) {
      await new Promise(r => ff.stdin.once("drain", r));
    }
    if (f % args.fps === 0) {
      const pct = Math.round(100 * f / totalFrames);
      process.stdout.write(`\r  ${pct}%  frame ${f}/${totalFrames}   `);
    }
  }
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));
  await browser.close();

  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n✓ done in ${dt}s · ${args.output}`);
  console.log("  next: ./convert-formats.sh " + args.output + " (60fps + GIF)");
  console.log("  then: ./add-music.sh " + args.output.replace(/\.mp4$/, "_60.mp4") + " <bgm>");
}

main().catch(e => {
  console.error("\n✗", e.message);
  process.exit(1);
});
