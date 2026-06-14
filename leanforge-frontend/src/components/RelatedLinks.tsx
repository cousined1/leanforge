import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';

export interface RelatedLink {
  href: string;
  label: string;
  description: string;
  icon?: LucideIcon;
}

interface RelatedLinksProps {
  title?: string;
  description?: string;
  links: RelatedLink[];
  columns?: 2 | 3 | 4;
}

const COLS: Record<2 | 3 | 4, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-2 lg:grid-cols-3',
  4: 'md:grid-cols-2 lg:grid-cols-4',
};

export function RelatedLinks({
  title = 'Related pages',
  description,
  links,
  columns = 3,
}: RelatedLinksProps) {
  if (links.length === 0) return null;

  return (
    <section aria-labelledby="related-pages-heading" className="py-12 border-t">
      <div className="container">
        <div className="mb-8">
          <h2
            id="related-pages-heading"
            className="text-2xl font-bold mb-2"
          >
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        <ul className={`grid grid-cols-1 ${COLS[columns]} gap-4`}>
          {links.map((link) => {
            const Icon = link.icon ?? ArrowRight;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="card p-6 h-full flex flex-col gap-2 hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{link.label}</span>
                    <Icon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                  <p className="text-sm text-muted-foreground">{link.description}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
