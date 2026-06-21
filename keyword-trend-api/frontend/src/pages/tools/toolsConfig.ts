// Free SEO tool pages (Clipy playbook): each route targets one specific, boring
// long-tail query a real SEO types. No signup wall. Tools run client-side against
// the existing /api/v1 endpoints. Static hero + intro + FAQ render server-side
// (see prerender.mjs) so crawlers and AI answer engines see real content.

export type ToolKind = 'lookup' | 'list' | 'trending' | 'compare';
export type Emphasis = 'searchVolume' | 'difficulty' | 'cpc' | 'trendScore' | 'chart';

export interface ToolFaq {
  q: string;
  a: string;
}

export interface ToolDef {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  kind: ToolKind;
  /** lookup: which metric the result card leads with */
  emphasis?: Emphasis;
  /** list: query params passed to fetchKeywords */
  listParams?: { direction?: string; category?: string; limit?: number };
  /** list: optional client-side sort key (desc) */
  listSort?: 'velocity' | 'trendScore' | 'difficulty';
  /** static, server-rendered SEO body copy */
  intro: string;
  faqs: ToolFaq[];
}

export const TOOLS: ToolDef[] = [
  {
    slug: 'keyword-volume-checker',
    metaTitle: 'Free Keyword Volume Checker — No Signup Required',
    metaDescription:
      'Check the monthly search volume, SEO difficulty, CPC and trend direction for any keyword. Free keyword volume checker — no account needed.',
    h1: 'Free Keyword Volume Checker',
    tagline:
      'Enter any keyword to see its search volume, difficulty, CPC estimate and 90-day trend — instantly, with no signup.',
    kind: 'lookup',
    emphasis: 'searchVolume',
    intro:
      'This free keyword volume checker pulls search-interest and trend data so you can size up a keyword before you write a single line of content. Type a term, and we look it up in the LeanForge index — search volume, difficulty, CPC and whether interest is rising or falling.',
    faqs: [
      {
        q: 'Is this keyword volume checker really free?',
        a: 'Yes. Every tool on this page is free to use with no signup or credit card. We monetise through optional upgrades and partner tools, not by gating the basics.',
      },
      {
        q: 'Where does the search volume data come from?',
        a: 'Volumes and trend scores are derived from Google Trends interest data and search-volume sources, refreshed on a rolling schedule in the LeanForge keyword index.',
      },
    ],
  },
  {
    slug: 'trending-keywords',
    metaTitle: 'Trending Keywords Right Now — Free Live Tracker',
    metaDescription:
      'See which keywords are trending right now across SEO, AI and SaaS. Free live trending keywords tracker — updated continuously, no signup.',
    h1: 'Trending Keywords Right Now',
    tagline:
      'The keywords gaining the most search interest right now, ranked by trend velocity. Updated continuously.',
    kind: 'trending',
    intro:
      'Catch a keyword while it is still rising. This free tracker surfaces the terms with the strongest upward trend velocity in the LeanForge index right now — useful for content planning, product launches and riding a wave before it crests.',
    faqs: [
      {
        q: 'How often do trending keywords update?',
        a: 'The trending list is computed from the latest trend snapshots in the index and refreshes on a rolling schedule, so the ranking reflects current momentum rather than all-time volume.',
      },
      {
        q: 'What does trend velocity mean?',
        a: 'Velocity measures how fast search interest is accelerating. A high velocity means a keyword is climbing quickly, even if its absolute volume is still modest.',
      },
    ],
  },
  {
    slug: 'keyword-difficulty-checker',
    metaTitle: 'Free Keyword Difficulty Checker — Find Easy Keywords',
    metaDescription:
      'Check SEO keyword difficulty for free and find low-competition keywords you can actually rank for. No signup, instant difficulty score 0-100.',
    h1: 'Free Keyword Difficulty Checker',
    tagline:
      'Get a 0-100 SEO difficulty score for any keyword so you can target the ones you can realistically rank for.',
    kind: 'lookup',
    emphasis: 'difficulty',
    intro:
      'Not every keyword is worth chasing. This free keyword difficulty checker gives you a 0-100 difficulty score — lower is easier — alongside volume and trend so you can pick winnable battles instead of fighting incumbents for head terms.',
    faqs: [
      {
        q: 'What is a good keyword difficulty score?',
        a: 'Lower is easier. As a rough guide, scores under 30 are realistic targets for newer or low-authority sites, while 60+ usually needs strong backlinks and established topical authority.',
      },
      {
        q: 'Should I only target low-difficulty keywords?',
        a: 'Start there to build momentum, but balance difficulty against volume and trend. A rising low-difficulty keyword is often a better bet than a flat, high-volume one.',
      },
    ],
  },
  {
    slug: 'google-trends-alternative',
    metaTitle: 'Free Google Trends Alternative — Keyword Interest Tracker',
    metaDescription:
      'A free Google Trends alternative for tracking keyword interest over time. Browse trending terms with search volume and difficulty in one view.',
    h1: 'Free Google Trends Alternative',
    tagline:
      'Track keyword interest over time — with the search volume, difficulty and CPC that Google Trends leaves out.',
    kind: 'list',
    listParams: { limit: 24 },
    intro:
      'Google Trends shows relative interest but hides the numbers SEOs actually need. This free alternative pairs trend direction with concrete search volume, difficulty and CPC for each keyword, so you can go from "interesting" to "worth targeting" in one screen.',
    faqs: [
      {
        q: 'How is this different from Google Trends?',
        a: 'Google Trends gives relative interest only. LeanForge adds absolute search volume, a 0-100 difficulty score, CPC and a trend score per keyword, plus a clean JSON API.',
      },
      {
        q: 'Can I see the trend history for a keyword?',
        a: 'Yes — open any keyword to see its trend chart and 90-day history alongside its metrics.',
      },
    ],
  },
  {
    slug: 'keyword-velocity-tracker',
    metaTitle: 'Keyword Velocity Tracker — Find Accelerating Keywords',
    metaDescription:
      'Track which keywords are accelerating in popularity. Free keyword velocity tracker ranks terms by how fast their search interest is climbing.',
    h1: 'Keyword Velocity Tracker',
    tagline:
      'Rank keywords by how fast their interest is accelerating — not just total volume — to catch momentum early.',
    kind: 'list',
    listParams: { direction: 'rising', limit: 24 },
    listSort: 'velocity',
    intro:
      'Volume tells you where demand is; velocity tells you where it is going. This tracker ranks rising keywords by acceleration so you can publish into momentum instead of into a plateau.',
    faqs: [
      {
        q: 'Why track velocity instead of volume?',
        a: 'A high-volume keyword may already be saturated and flat. A high-velocity keyword is climbing — getting in early means you rank as demand grows rather than after it peaks.',
      },
      {
        q: 'What does "rising" mean here?',
        a: 'Rising keywords have a positive trend direction over the recent window. We then sort them by velocity so the fastest movers are at the top.',
      },
    ],
  },
  {
    slug: 'keyword-comparison-tool',
    metaTitle: 'Compare Keyword Trends — Free Side-by-Side Tool',
    metaDescription:
      'Compare up to 5 keywords side by side — search volume, difficulty, CPC and trend direction in one table. Free keyword comparison tool, no signup.',
    h1: 'Compare Keyword Trends',
    tagline:
      'Pit up to five keywords against each other — volume, difficulty, CPC and trend — to decide which one to target.',
    kind: 'compare',
    intro:
      'Stuck between a few keyword ideas? Enter up to five and compare them side by side on the metrics that decide ROI: search volume, difficulty, CPC and trend direction. The clear winner usually jumps out.',
    faqs: [
      {
        q: 'How many keywords can I compare?',
        a: 'Up to five at once. Enter each term and we look up its metrics so you can see them lined up in a single table.',
      },
      {
        q: 'Which metric should decide the winner?',
        a: 'It depends on intent: chase volume for reach, low difficulty for quick wins, high CPC for commercial value, and a rising trend for longevity. The table lets you weigh all four.',
      },
    ],
  },
  {
    slug: 'seo-keyword-research',
    metaTitle: 'Free SEO Keyword Research Tool — No Account Required',
    metaDescription:
      'Free SEO keyword research tool. Browse a curated index of keywords with search volume, difficulty, CPC and trend direction. No signup needed.',
    h1: 'Free SEO Keyword Research Tool',
    tagline:
      'Browse a curated index of keywords with the volume, difficulty and trend data you need to build a content plan.',
    kind: 'list',
    listParams: { limit: 50 },
    intro:
      'Keyword research should not cost $99/month to get started. Browse the LeanForge index free — each keyword comes with search volume, a difficulty score, CPC and trend direction, so you can assemble a content plan in one sitting.',
    faqs: [
      {
        q: 'Do I need an account to do keyword research here?',
        a: 'No. Browse and open any keyword for free, no signup. An account and paid plans unlock larger exports, deeper history and API access.',
      },
      {
        q: 'How do I find keywords for my niche?',
        a: 'Open any keyword to see its category, then browse that category for related terms. The trending and velocity tools surface what is moving right now.',
      },
    ],
  },
  {
    slug: 'keyword-trend-chart',
    metaTitle: 'Keyword Trend Chart Generator — Free, Instant',
    metaDescription:
      'Generate a keyword trend chart in seconds. Free keyword trend chart generator showing 90-day search interest for any term. No signup.',
    h1: 'Keyword Trend Chart Generator',
    tagline:
      'Type a keyword and get an instant 90-day trend chart of its search interest — ready to screenshot.',
    kind: 'lookup',
    emphasis: 'chart',
    intro:
      'Need a quick visual of where a keyword is heading? This free generator charts a keyword’s search interest over the last 90 days so you can spot the shape of demand — climbing, cooling or seasonal — at a glance.',
    faqs: [
      {
        q: 'How far back does the trend chart go?',
        a: 'The chart shows recent trend snapshots from the index — typically a rolling 90-day window. Paid plans extend history to 365 days.',
      },
      {
        q: 'Can I use the chart in a report?',
        a: 'Yes — it is free to screenshot and share. A link back to LeanForge is appreciated but not required.',
      },
    ],
  },
  {
    slug: 'long-tail-keyword-finder',
    metaTitle: 'Free Long-Tail Keyword Finder — Low Competition Terms',
    metaDescription:
      'Find low-competition, rising long-tail keywords for SEO. Free long-tail keyword finder with difficulty and trend data. No signup required.',
    h1: 'Free Long-Tail Keyword Finder',
    tagline:
      'Surface rising, low-competition long-tail keywords you can rank for — with difficulty and trend baked in.',
    kind: 'list',
    listParams: { direction: 'rising', limit: 24 },
    listSort: 'difficulty',
    intro:
      'Long-tail keywords convert better and rank faster. This finder surfaces rising terms and sorts them by difficulty so the easiest, fastest-moving opportunities float to the top of your list.',
    faqs: [
      {
        q: 'What counts as a long-tail keyword?',
        a: 'Longer, more specific phrases with clearer intent and lower competition than head terms. They individually have less volume but convert better and are easier to rank for.',
      },
      {
        q: 'Why sort by difficulty?',
        a: 'Among rising keywords, the lowest-difficulty ones are the quickest wins — you rank sooner and capture the trend while it climbs.',
      },
    ],
  },
  {
    slug: 'keyword-calculator',
    metaTitle: 'Keyword CPC & ROI Calculator — Free SEO/PPC Tool',
    metaDescription:
      'Estimate the cost and ROI of ranking or bidding on a keyword. Free keyword CPC and ROI calculator using real CPC and volume data. No signup.',
    h1: 'Keyword CPC & ROI Calculator',
    tagline:
      'Estimate the traffic value and potential ROI of any keyword from its CPC and search volume.',
    kind: 'lookup',
    emphasis: 'cpc',
    intro:
      'What is a keyword actually worth? This calculator takes a keyword’s CPC and volume and, with your conversion rate and order value, estimates the monthly traffic value and ROI of ranking for — or bidding on — it.',
    faqs: [
      {
        q: 'How is keyword value estimated?',
        a: 'We combine the keyword’s CPC and search volume with your conversion rate and average order value to estimate monthly clicks, traffic value and revenue. Adjust the inputs to model your own funnel.',
      },
      {
        q: 'Does a high CPC mean a keyword is good?',
        a: 'High CPC signals commercial intent — advertisers pay because it converts. Ranking organically for high-CPC terms can be very profitable, but they are usually harder to rank for.',
      },
    ],
  },
];

const BY_SLUG: Record<string, ToolDef> = Object.fromEntries(
  TOOLS.map((t) => [t.slug, t])
);

export function getTool(slug: string | undefined): ToolDef | undefined {
  return slug ? BY_SLUG[slug] : undefined;
}

/** Slugify a free-text keyword the same way the backend stores slugs. */
export function slugifyTerm(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
