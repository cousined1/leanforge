import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { absoluteUrl } from '../lib/site';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const location = useLocation();
  const all = [{ label: 'Home', href: '/' }, ...items];

  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/40">
        {all.map((item, idx) => {
          const isLast = idx === all.length - 1;
          return (
            <li key={idx} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  to={item.href}
                  className="hover:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? 'text-white/70' : ''}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <span className="text-white/20" aria-hidden>
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: all.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: item.label,
              item: item.href ? absoluteUrl(item.href) : absoluteUrl(location.pathname),
            })),
          }),
        }}
      />
    </nav>
  );
}

export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {children}
    </div>
  );
}
