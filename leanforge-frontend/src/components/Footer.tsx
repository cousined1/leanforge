import Link from 'next/link';
import { routes, footerProductRoutes, footerCompanyRoutes, footerResourceRoutes, footerLegalRoutes } from '@/lib/routes';

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t bg-muted/20 py-12" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link
              href="/"
              className="font-semibold mb-3 inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              aria-label="LeanForge home"
            >
              LeanForge
            </Link>
            <p className="text-sm text-muted-foreground">
              Keyword intelligence platform for SEO professionals.
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              Operated by Developer312, a subsidiary of NIGHT LITE USA LLC.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Product</h3>
            <ul className="space-y-2 text-sm" aria-label="Product links">
              {footerProductRoutes.map((key) => {
                const route = routes[key];
                return (
                  <li key={key}>
                    <Link
                      href={route.path}
                      className="text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                    >
                      {route.shortLabel || route.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Company</h3>
            <ul className="space-y-2 text-sm" aria-label="Company links">
              {footerCompanyRoutes.map((key) => {
                const route = routes[key];
                return (
                  <li key={key}>
                    <Link
                      href={route.path}
                      className="text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                    >
                      {route.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <h3 className="font-semibold mt-6 mb-4 text-sm uppercase tracking-wide text-muted-foreground">Resources</h3>
            <ul className="space-y-2 text-sm" aria-label="Resource links">
              {footerResourceRoutes.map((key) => {
                const route = routes[key];
                return (
                  <li key={key}>
                    <Link
                      href={route.path}
                      className="text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                    >
                      {route.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">Get in touch</h3>
            <ul className="space-y-2 text-sm" aria-label="Contact links">
              <li>
                <a
                  href="mailto:hello@developer312.com"
                  className="text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                >
                  hello@developer312.com
                </a>
              </li>
              <li>
                <Link
                  href={routes.contact.path}
                  className="text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                >
                  Contact form
                </Link>
              </li>
              <li>
                <Link
                  href={routes.helpCenter.path}
                  className="text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                >
                  Help Center
                </Link>
              </li>
            </ul>
            <h3 className="font-semibold mt-6 mb-4 text-sm uppercase tracking-wide text-muted-foreground">Legal</h3>
            <ul className="space-y-2 text-sm" aria-label="Legal links">
              {footerLegalRoutes.map((key) => {
                const route = routes[key];
                return (
                  <li key={key}>
                    <Link
                      href={route.path}
                      className="text-foreground/80 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                    >
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
