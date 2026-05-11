import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { JsonLd, breadcrumbLd } from '@/components/JsonLd';
import { buildMetadata } from '@/lib/seo';
import { absoluteUrl } from '@/lib/site';
import { FaqContent } from './FaqContent';

export const metadata: Metadata = buildMetadata({
  title: 'FAQ',
  description: 'Frequently asked questions about LeanForge keyword intelligence, API access, pricing, and features.',
  path: '/faq',
});

export default function FaqPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: 'FAQ' }]} />
      <JsonLd data={breadcrumbLd([
        { name: 'Home', url: absoluteUrl('/') },
        { name: 'FAQ', url: absoluteUrl('/faq') },
      ])} />
      <FaqContent />
    </div>
  );
}