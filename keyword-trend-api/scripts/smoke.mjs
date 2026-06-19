// Production smoke test for the core loop: keyword -> trend score -> rendered result (audit B-03).
// Asserts the live API returns a numeric trend score within an SLA. Pure Node (global fetch, Node 20+).
//
// Usage:
//   node scripts/smoke.mjs
//   SMOKE_BASE_URL=https://lean-forge.net SMOKE_SLA_MS=3000 node scripts/smoke.mjs
// Exit 0 = pass, exit 1 = fail (wire as a post-deploy check).
const BASE = (process.env.SMOKE_BASE_URL || 'https://lean-forge.net').replace(/\/+$/, '');
const SLA_MS = Number(process.env.SMOKE_SLA_MS || 3000);

async function getJson(pathname) {
  const t0 = Date.now();
  const res = await fetch(`${BASE}${pathname}`, { headers: { accept: 'application/json' } });
  const ms = Date.now() - t0;
  if (!res.ok) throw new Error(`${pathname} -> HTTP ${res.status}`);
  return { body: await res.json(), ms };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

function isScore(v) {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100;
}

async function main() {
  // 1. keyword -> score: trending list returns keywords each carrying a numeric trend score.
  const trending = await getJson('/api/v1/keywords/trending?limit=5');
  assert(Array.isArray(trending.body.data) && trending.body.data.length > 0, 'trending: empty data');
  const top = trending.body.data[0];
  assert(isScore(top.trendScore), `trending: bad trendScore ${top.trendScore}`);
  assert(trending.ms < SLA_MS, `trending: ${trending.ms}ms over SLA ${SLA_MS}ms`);

  // 2. render result: fetch a keyword by slug and assert the detail view has a numeric score.
  //    Pick a slash-free slug (some seed slugs contain '/', which is not URL-routable).
  const safe = trending.body.data.find((k) => k.slug && !k.slug.includes('/')) || top;
  const detail = await getJson(`/api/v1/keywords/${encodeURIComponent(safe.slug)}`);
  assert(detail.body.data && isScore(detail.body.data.trendScore), 'detail: missing numeric trendScore');
  assert(detail.ms < SLA_MS, `detail: ${detail.ms}ms over SLA ${SLA_MS}ms`);

  console.log(`SMOKE PASS  ${BASE}`);
  console.log(`  top: "${top.term}" score=${top.trendScore} dir=${top.direction} (${trending.ms}ms)`);
  console.log(`  detail: "${detail.body.data.term}" score=${detail.body.data.trendScore} (${detail.ms}ms)`);
}

main().catch((err) => {
  console.error(`SMOKE FAIL  ${err.message}`);
  process.exit(1);
});
