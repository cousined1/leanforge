import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
import App from './App';

// Server render entry used ONLY by prerender.mjs at build time. Renders a route to an
// HTML string plus the react-helmet-async head tags (title/description/og/twitter/
// canonical/JSON-LD) so static marketing routes ship real content in the raw HTML.
// Never imported by the client bundle (main.tsx is the client entry).
export function render(url: string): { appHtml: string; headTags: string } {
  const helmetContext: { helmet?: HelmetServerState } = {};
  const appHtml = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </HelmetProvider>,
  );
  const { helmet } = helmetContext;
  const headTags = helmet
    ? [helmet.title, helmet.meta, helmet.link, helmet.script]
        .map((tag) => tag.toString().trim())
        .filter(Boolean)
        .join('\n    ')
    : '';
  return { appHtml, headTags };
}
