// assets/deck_stage.js
// <deck-stage> — web component for single-file slide decks.
//
// HARD RULES (do not break, you will spend hours debugging):
//   1. <script src="deck_stage.js"> MUST come AFTER </deck-stage>, not before.
//      The component upgrades on connectedCallback; if the children are
//      already in DOM and styled, slot fallback works. If you put the script
//      in <head>, slides flash unstyled and arrow keys race.
//   2. The active slide must use display:flex (not block). The CSS in this
//      file enforces that with [data-active="true"] { display:flex }.
//      If you override .active in user CSS, use display:flex.
//   3. Each <article class="slide"> is one slide. Anything not wrapped in
//      <article class="slide"> is ignored.
//
// Features:
//   • Auto-scale: deck is authored at 1920×1080; the component scales to
//     fit the viewport while preserving 16:9. Letterbox bars are black.
//   • Keyboard: ←/→/PgUp/PgDn/Space to navigate, F for fullscreen,
//     S to toggle speaker notes, P to print to PDF (browser print dialog).
//   • Position memory: localStorage[deck:<title>] remembers last slide.
//     Append ?reset=1 to URL to clear.
//   • Speaker notes: any <aside class="notes"> inside a slide shows in
//     the notes panel (toggle with S).
//   • Page numbers: optional via the page-numbers attribute.
//
// Usage:
//   <deck-stage title="My deck" page-numbers>
//     <article class="slide">…</article>
//     <article class="slide">…</article>
//   </deck-stage>
//   <script src="../assets/deck_stage.js"></script>

(function () {
  const STAGE_W = 1920;
  const STAGE_H = 1080;

  const css = `
    deck-stage {
      display: block;
      position: fixed;
      inset: 0;
      background: #000;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif;
    }
    deck-stage .deck-frame {
      position: absolute;
      width: ${STAGE_W}px;
      height: ${STAGE_H}px;
      top: 50%;
      left: 50%;
      transform-origin: 0 0;
      background: #fff;
      overflow: hidden;
    }
    deck-stage .slide {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      display: none;
      box-sizing: border-box;
      flex-direction: column;
      overflow: hidden;
    }
    deck-stage .slide[data-active="true"] {
      display: flex;
    }
    deck-stage .deck-pager {
      position: fixed;
      bottom: 16px;
      right: 20px;
      color: rgba(255,255,255,0.5);
      font-size: 13px;
      font-variant-numeric: tabular-nums;
      pointer-events: none;
      z-index: 10;
    }
    deck-stage .deck-notes {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      background: rgba(0,0,0,0.92);
      color: #f5f5f5;
      padding: 16px 24px 20px;
      font-size: 16px;
      line-height: 1.5;
      max-height: 30vh;
      overflow: auto;
      transform: translateY(100%);
      transition: transform 200ms ease;
      z-index: 20;
    }
    deck-stage .deck-notes[data-open="true"] {
      transform: translateY(0);
    }
    deck-stage .deck-notes h4 {
      margin: 0 0 8px 0;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255,255,255,0.5);
      font-weight: 500;
    }
    deck-stage .slide aside.notes { display: none; }
    @media print {
      deck-stage { position: static; background: none; }
      deck-stage .deck-frame { position: static; transform: none; width: 100%; height: 100vh; }
      deck-stage .slide { display: flex !important; page-break-after: always; }
      deck-stage .deck-pager, deck-stage .deck-notes { display: none; }
    }
  `;

  // Inject stylesheet once
  if (!document.getElementById("deck-stage-style")) {
    const style = document.createElement("style");
    style.id = "deck-stage-style";
    style.textContent = css;
    document.head.appendChild(style);
  }

  class DeckStage extends HTMLElement {
    connectedCallback() {
      const title = this.getAttribute("title") || "deck";
      this._storageKey = `deck:${title}`;
      this._showPager = this.hasAttribute("page-numbers");

      // Build frame and reparent slides into it
      const frame = document.createElement("div");
      frame.className = "deck-frame";

      const slides = Array.from(this.querySelectorAll(":scope > article.slide"));
      slides.forEach(s => frame.appendChild(s));
      this.appendChild(frame);
      this._frame = frame;
      this._slides = slides;

      // Pager
      if (this._showPager) {
        this._pager = document.createElement("div");
        this._pager.className = "deck-pager";
        this.appendChild(this._pager);
      }

      // Notes panel
      this._notes = document.createElement("div");
      this._notes.className = "deck-notes";
      this._notes.innerHTML = `<h4>Speaker notes</h4><div class="deck-notes-body"></div>`;
      this._notesBody = this._notes.querySelector(".deck-notes-body");
      this.appendChild(this._notes);

      // URL reset
      const url = new URL(window.location.href);
      if (url.searchParams.get("reset") === "1") {
        try { localStorage.removeItem(this._storageKey); } catch {}
      }

      // Restore position
      let start = 0;
      try {
        const saved = parseInt(localStorage.getItem(this._storageKey), 10);
        if (!isNaN(saved) && saved >= 0 && saved < slides.length) start = saved;
      } catch {}
      this._index = start;

      this._scale();
      this._render();
      this._bind();
    }

    disconnectedCallback() {
      this._unbind && this._unbind();
    }

    _scale() {
      const fit = () => {
        const sx = window.innerWidth / STAGE_W;
        const sy = window.innerHeight / STAGE_H;
        const s = Math.min(sx, sy);
        this._frame.style.transform = `translate(-50%, -50%) scale(${s})`;
      };
      fit();
      this._onResize = fit;
      window.addEventListener("resize", fit);
    }

    _render() {
      this._slides.forEach((s, i) => {
        if (i === this._index) s.setAttribute("data-active", "true");
        else s.removeAttribute("data-active");
      });
      if (this._pager) {
        this._pager.textContent = `${this._index + 1} / ${this._slides.length}`;
      }
      // Speaker notes
      const noteEl = this._slides[this._index].querySelector("aside.notes");
      this._notesBody.textContent = noteEl ? noteEl.textContent.trim() : "(no notes)";
      try { localStorage.setItem(this._storageKey, String(this._index)); } catch {}
    }

    _go(delta) {
      const next = Math.max(0, Math.min(this._slides.length - 1, this._index + delta));
      if (next !== this._index) {
        this._index = next;
        this._render();
      }
    }

    _bind() {
      const onKey = (e) => {
        // ignore if focus is in a form field
        const tag = (document.activeElement && document.activeElement.tagName) || "";
        if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return;
        switch (e.key) {
          case "ArrowRight":
          case "PageDown":
          case " ":
            e.preventDefault(); this._go(1); break;
          case "ArrowLeft":
          case "PageUp":
            e.preventDefault(); this._go(-1); break;
          case "Home":
            e.preventDefault(); this._index = 0; this._render(); break;
          case "End":
            e.preventDefault(); this._index = this._slides.length - 1; this._render(); break;
          case "f":
          case "F":
            if (!document.fullscreenElement) this.requestFullscreen?.();
            else document.exitFullscreen?.();
            break;
          case "s":
          case "S":
            this._notes.toggleAttribute("data-open"); break;
          case "p":
          case "P":
            window.print(); break;
        }
      };
      window.addEventListener("keydown", onKey);
      this._unbind = () => {
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("resize", this._onResize);
      };
    }
  }

  if (!customElements.get("deck-stage")) {
    customElements.define("deck-stage", DeckStage);
  }
})();
