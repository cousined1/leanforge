#!/usr/bin/env python3
"""
scripts/verify.py

Render an HTML file to PNG via headless Chromium so the agent can
look at its own work. Use this BEFORE claiming a design is done.

Usage:
    python3 verify.py <input.html> [--out file.png] [--width N] [--height N]
                                   [--full-page] [--wait-selector CSS]
                                   [--device iPhone 15 Pro]

Examples:
    # Single 1920x1080 screenshot, save next to input
    python3 verify.py hero.html

    # Full-page capture (entire scrollable canvas)
    python3 verify.py landing.html --full-page

    # iPhone-sized capture for a mobile prototype
    python3 verify.py app.html --width 393 --height 852

    # Wait for a specific element before snapping
    python3 verify.py chart.html --wait-selector "#chart .ready"

Notes:
    • Sets window.__verifying = true before navigating, so animations
      can freeze on a representative frame if they listen for it.
    • Default wait: networkidle. Override with --wait-selector for
      anything async (font loading, image decoding, chart rendering).
    • Returns exit 0 on success, non-zero on failure.

Requirements:
    pip install playwright
    python3 -m playwright install chromium
"""

import argparse
import asyncio
import sys
from pathlib import Path


async def capture(args):
    from playwright.async_api import async_playwright

    input_path = Path(args.input).resolve()
    if not input_path.exists():
        print(f"✗ input not found: {input_path}", file=sys.stderr)
        return 1

    out = args.out or str(input_path.with_suffix(".png"))

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": args.width, "height": args.height},
            device_scale_factor=2,  # retina screenshots — sharper for review
        )
        page = await context.new_page()
        await page.add_init_script("window.__verifying = true;")
        await page.goto(f"file://{input_path}", wait_until="networkidle")

        if args.wait_selector:
            try:
                await page.wait_for_selector(args.wait_selector, timeout=15000)
            except Exception as e:
                print(f"✗ wait_selector '{args.wait_selector}' never matched: {e}", file=sys.stderr)
                await browser.close()
                return 2

        # Give web fonts and images a beat to decode.
        await page.evaluate("document.fonts && document.fonts.ready")
        await page.wait_for_timeout(200)

        await page.screenshot(path=out, full_page=args.full_page, type="png")
        await browser.close()

    size_kb = Path(out).stat().st_size // 1024
    print(f"✓ {out}  ({args.width}×{args.height}{' full-page' if args.full_page else ''}, {size_kb}KB)")
    return 0


def main():
    parser = argparse.ArgumentParser(description="Render HTML to PNG for design verification.")
    parser.add_argument("input", help="path to HTML file")
    parser.add_argument("--out", help="output PNG path (default: <input>.png)")
    parser.add_argument("--width", type=int, default=1920, help="viewport width (default 1920)")
    parser.add_argument("--height", type=int, default=1080, help="viewport height (default 1080)")
    parser.add_argument("--full-page", action="store_true", help="capture entire scrollable page")
    parser.add_argument("--wait-selector", help="wait for this CSS selector before capture")
    args = parser.parse_args()
    sys.exit(asyncio.run(capture(args)))


if __name__ == "__main__":
    main()
