// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  {
    name: 'SEO & Content Marketing',
    slug: 'seo',
    description: 'Search engine optimization, content strategy, and SERP trends',
    icon: '📊',
    color: '#06B6D4',
  },
  {
    name: 'AI & Machine Learning',
    slug: 'ai',
    description: 'Artificial intelligence, LLMs, AI agents, and automation',
    icon: '🤖',
    color: '#8B5CF6',
  },
  {
    name: 'SaaS & Startups',
    slug: 'saas',
    description: 'Software-as-a-Service, product-led growth, and startup metrics',
    icon: '🚀',
    color: '#10B981',
  },
  {
    name: 'Developer Tools',
    slug: 'devtools',
    description: 'Programming, frameworks, and developer experience',
    icon: '⚡',
    color: '#F59E0B',
  },
  {
    name: 'Cybersecurity & Compliance',
    slug: 'security',
    description: 'InfoSec, compliance frameworks, and data protection',
    icon: '🔒',
    color: '#EF4444',
  },
  {
    name: 'Carbon & ESG',
    slug: 'carbon',
    description: 'Carbon accounting, ESG reporting, and sustainability',
    icon: '🌍',
    color: '#22C55E',
  },
];

const seedKeywords: Record<string, string[]> = {
  seo: [
    'content marketing',
    'link building',
    'technical SEO',
    'keyword research',
    'SERP features',
    'core web vitals',
    'schema markup',
    'E-E-A-T',
    'AI search optimization',
    'GEO score',
    'content scoring',
    'backlink analysis',
    'featured snippets',
    'zero-click searches',
    'topic clusters',
  ],
  ai: [
    'ChatGPT',
    'Gemini AI',
    'Claude AI',
    'AI agents',
    'prompt engineering',
    'RAG architecture',
    'AI coding assistants',
    'LLM fine-tuning',
    'AI regulation',
    'model context protocol',
    'AI code review',
    'AI content detection',
    'autonomous agents',
    'function calling',
  ],
  saas: [
    'product-led growth',
    'SaaS churn',
    'customer success',
    'onboarding optimization',
    'pricing strategy',
    'PLG metrics',
    'SaaS compliance',
    'usage-based pricing',
    'SaaS valuations',
    'net revenue retention',
    'expansion revenue',
    'freemium conversion',
  ],
  devtools: [
    'TypeScript',
    'Next.js 14',
    'React server components',
    'Bun runtime',
    'Deno 2',
    'edge computing',
    'WebAssembly',
    'AI code generation',
    'dev environments',
    'CI/CD pipelines',
  ],
  security: [
    'zero trust',
    'SBOM',
    'software supply chain',
    'SOC 2 compliance',
    'code provenance',
    'GitHub security',
    'AI code audit',
    'FedRAMP',
    'CISA compliance',
    'spear phishing',
  ],
  carbon: [
    'carbon accounting software',
    'ESG reporting',
    'scope 3 emissions',
    'SBTi targets',
    'carbon credits',
    'GHG protocol',
    'climate disclosure',
    'TCFD reporting',
    'CSRD compliance',
    'supply chain emissions',
  ],
};

async function main() {
  console.log('🌱 Seeding categories...');

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
  }

  console.log('🌱 Seeding keywords...');

  for (const [slug, keywords] of Object.entries(seedKeywords)) {
    for (const term of keywords) {
      await prisma.keyword.upsert({
        where: { slug: term.toLowerCase().replace(/\s+/g, '-') },
        update: { category: slug },
        create: {
          term,
          slug: term.toLowerCase().replace(/\s+/g, '-'),
          category: slug,
          source: 'seed',
        },
      });
    }
  }

  console.log('✅ Seed complete');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
