import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { type RouteKey, getRoute } from '@/lib/routes';

interface CtaLink {
  label: string;
  href: string;
  variant?: 'primary' | 'outline' | 'secondary';
  icon?: LucideIcon;
}

interface CtaSectionProps {
  title: string;
  description: string;
  primary?: CtaLink;
  secondary?: CtaLink;
  tertiary?: CtaLink;
  className?: string;
}

function variantClass(variant: CtaLink['variant']): string {
  switch (variant) {
    case 'outline':
      return 'btn-outline';
    case 'secondary':
      return 'btn-secondary';
    case 'primary':
    default:
      return 'btn-primary';
  }
}

function resolveLink(link: CtaLink): CtaLink {
  // Allow callers to pass a route key via href starting with 'route:' for typed routing.
  if (link.href.startsWith('route:')) {
    const key = link.href.slice(6) as RouteKey;
    return { ...link, href: getRoute(key).path };
  }
  return link;
}

export function CtaSection({
  title,
  description,
  primary,
  secondary,
  tertiary,
  className = '',
}: CtaSectionProps) {
  const primaryResolved = primary && resolveLink(primary);
  const secondaryResolved = secondary && resolveLink(secondary);
  const tertiaryResolved = tertiary && resolveLink(tertiary);

  return (
    <section
      aria-labelledby="cta-heading"
      className={`py-12 border-t bg-muted/20 ${className}`}
    >
      <div className="container max-w-2xl text-center">
        <h2 id="cta-heading" className="text-xl font-bold mb-3">
          {title}
        </h2>
        <p className="text-muted-foreground mb-6">{description}</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {primaryResolved && (
            <Link
              href={primaryResolved.href}
              className={`${variantClass(primaryResolved.variant)} px-5 py-2 text-sm inline-flex items-center gap-2`}
            >
              {primaryResolved.label}
              <span aria-hidden="true">→</span>
            </Link>
          )}
          {secondaryResolved && (
            <Link
              href={secondaryResolved.href}
              className={`${variantClass(secondaryResolved.variant)} px-5 py-2 text-sm`}
            >
              {secondaryResolved.label}
            </Link>
          )}
          {tertiaryResolved && (
            <Link
              href={tertiaryResolved.href}
              className="text-primary hover:underline text-sm font-medium"
            >
              {tertiaryResolved.label} →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
