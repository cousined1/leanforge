import { Link } from 'react-router-dom';
import { COMPANY_LEGAL_NAME, CONTACT_EMAIL } from '../lib/site';

const productLinks = [
  { label: 'Trending', to: '/' },
  { label: 'Features', to: '/features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'API Docs', to: '/api-docs' },
];

const companyLinks = [
  { label: 'About', to: '/about' },
  { label: 'Help Center', to: '/help-center' },
  { label: 'Contact', to: '/contact' },
];

const resourceLinks = [
  { label: 'FAQ', to: '/faq' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Cookie Policy', to: '/cookies' },
  { label: 'Disclaimer', to: '/disclaimer' },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 mb-8">
          <div>
            <h4 className="font-semibold mb-3 text-sm">LeanForge</h4>
            <p className="text-xs text-white/50 leading-relaxed">
              Real-time keyword trend intelligence for SEO professionals.
            </p>
            <p className="text-[10px] text-white/30 mt-3">
              Operated by Developer312, a subsidiary of {COMPANY_LEGAL_NAME}.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-xs" aria-label="Product links">
              {productLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-xs" aria-label="Company links">
              {companyLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  {CONTACT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm">Resources</h4>
            <ul className="space-y-2 text-xs" aria-label="Resource links">
              {resourceLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/30">
          <span>© {new Date().getFullYear()} Developer312. All rights reserved.</span>
          <span>
            LeanForge provides SEO trend data and informational guidance. Results are not
            guaranteed. Use at your own discretion.
          </span>
        </div>
      </div>
    </footer>
  );
}
