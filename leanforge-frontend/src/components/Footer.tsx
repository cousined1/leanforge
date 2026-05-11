import Link from 'next/link';
import { routes, footerProductRoutes, footerCompanyRoutes, footerResourceRoutes, footerLegalRoutes } from '@/lib/routes';

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t bg-muted/20 py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="font-semibold mb-4">LeanForge</h4>
            <p className="text-sm text-muted-foreground">
              Keyword intelligence platform for SEO professionals.
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              Operated by Developer312, a subsidiary of NIGHT LITE USA LLC.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm" aria-label="Product links">
              {footerProductRoutes.map((key) => {
                const route = routes[key];
                return (
                  <li key={key}>
                    <Link href={route.path} className="text-muted-foreground hover:text-foreground transition-colors">
                      {route.shortLabel || route.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm" aria-label="Company links">
              {footerCompanyRoutes.map((key) => {
                const route = routes[key];
                return (
                  <li key={key}>
                    <Link href={route.path} className="text-muted-foreground hover:text-foreground transition-colors">
                      {route.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <a
                  href="mailto:hello@developer312.com"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  hello@developer312.com
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2 text-sm" aria-label="Resource links">
              {footerResourceRoutes.map((key) => {
                const route = routes[key];
                return (
                  <li key={key}>
                    <Link href={route.path} className="text-muted-foreground hover:text-foreground transition-colors">
                      {route.shortLabel || route.label}
                    </Link>
                  </li>
                );
              })}
              {footerLegalRoutes.map((key) => {
                const route = routes[key];
                return (
                  <li key={key}>
                    <Link href={route.path} className="text-muted-foreground hover:text-foreground transition-colors">
                      {route.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="border-t pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted-foreground">
          <div>
            <p>&copy; {currentYear} Developer312. All rights reserved.</p>
            <p className="text-xs mt-1">Developer312 is a subsidiary of NIGHT LITE USA LLC.</p>
          </div>
          <p className="text-xs max-w-sm text-right">
            LeanForge provides SEO trend data and informational guidance.
            Results are not guaranteed. Use at your own discretion.
          </p>
        </div>
      </div>
    </footer>
  );
}