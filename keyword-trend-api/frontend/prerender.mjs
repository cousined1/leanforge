// Postbuild prerender of the static marketing routes -> dist/<route>/index.html.
//
// Why: the app is a client-rendered Vite SPA, so the raw HTML body is an empty
// <div id="root">. Crawlers and AI answer engines that don't execute JS see nothing.
// This renders the content-stable marketing routes to real HTML at build time
// (pure Node react-dom/server — no headless Chromium, so it is safe on Railway's
// nix builder).
//
// Fail-safe: ANY error exits 0. A prerender bug must never break the live deploy —
// worst case the site degrades to the client-rendered SPA shell it already ships.
import { build } from 'vite';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const root = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(root, 'dist');
const SSR_DIR = path.join(root, 'dist-ssr');

// Static, content-stable routes only. Excluded on purpose:
//   /keyword/:slug, /category/:slug  -> data-driven (need a DB fetch per slug)
//   /sign-in, /auth/callback         -> interactive + noindex (robots.txt disallows them)
// Those keep using the client-rendered app shell (dist/app-shell.html).
const ROUTES = [
  '/', '/features', '/pricing', '/about', '/faq', '/contact',
  '/help-center', '/api-docs', '/privacy', '/terms', '/cookies', '/disclaimer',
];

async function main() {
  const template = await fs.readFile(path.join(DIST, 'index.html'), 'utf8');

  // Pristine SPA shell for the Express fallback (dynamic routes). Keep the generic
  // <title> and an empty #root so dynamic pages do NOT inherit the homepage's
  // content or canonical URL.
  await fs.writeFile(path.join(DIST, 'app-shell.html'), template, 'utf8');

  // Compile the SSR entry to a Node-loadable bundle.
  await build({
    root,
    logLevel: 'warn',
    // Bundle deps into the SSR output so Rollup resolves CJS/ESM interop at build time
    // (react-helmet-async is CommonJS and breaks Node's ESM named-import otherwise).
    ssr: { noExternal: true },
    build: {
      ssr: 'src/entry-server.tsx',
      outDir: 'dist-ssr',
      emptyOutDir: true,
      rollupOptions: { output: { entryFileNames: 'entry-server.js' } },
    },
  });

  const { render, TOOL_ROUTES = [] } = await import(
    pathToFileUrl(path.join(SSR_DIR, 'entry-server.js'))
  );

  // Static marketing routes + the free SEO tool routes (from toolsConfig via entry-server).
  const allRoutes = [...ROUTES, ...TOOL_ROUTES];

  let written = 0;
  for (const route of allRoutes) {
    const { appHtml, headTags } = render(route);
    if (!appHtml) throw new Error(`empty render for ${route}`);

    const html = template
      // Drop the template's generic title + description; helmet emits per-route ones.
      .replace(/<title>.*?<\/title>/s, '')
      .replace(/<meta\s+name="description"[^>]*>/i, '')
      .replace('</head>', `    ${headTags}\n  </head>`)
      .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

    const outDir = route === '/' ? DIST : path.join(DIST, route);
    await fs.mkdir(outDir, { recursive: true });
    await fs.writeFile(path.join(outDir, 'index.html'), html, 'utf8');
    written += 1;
  }

  await fs.rm(SSR_DIR, { recursive: true, force: true });
  console.log(`[prerender] wrote ${written}/${allRoutes.length} static routes`);
}

// Windows-safe ESM dynamic import of an absolute path.
function pathToFileUrl(p) {
  return new URL(`file://${p.replace(/\\/g, '/').replace(/^([A-Za-z]:)/, '/$1')}`).href;
}

main().catch((err) => {
  console.error('[prerender] skipped (non-fatal):', err?.stack ?? err);
  process.exit(0); // never break the live build
});
