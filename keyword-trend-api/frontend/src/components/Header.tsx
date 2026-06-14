import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

interface NavItem {
  label: string;
  to: string;
}

const navItems: NavItem[] = [
  { label: 'Trending', to: '/' },
  { label: 'Features', to: '/features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'API', to: '/api-docs' },
  { label: 'FAQ', to: '/faq' },
];

export default function Header() {
  const [health, setHealth] = useState<'ok' | 'error' | 'loading'>('loading');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  useEffect(() => {
    fetch('/health')
      .then((r) => (r.ok ? setHealth('ok') : setHealth('error')))
      .catch(() => setHealth('error'));
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0B0C10]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-lg tracking-tight"
            aria-label="LeanForge home"
          >
            <span className="text-cyan-400" aria-hidden>
              ◆
            </span>
            <span className="gradient-text">LeanForge</span>
          </Link>

          <nav
            className="hidden md:flex items-center gap-5 text-sm"
            aria-label="Main navigation"
          >
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`transition-colors ${
                  location.pathname === item.to
                    ? 'text-white font-medium'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ))}
            <a
              href="/api/v1/keywords/trending"
              target="_blank"
              rel="noreferrer"
              className="text-white/40 hover:text-white/60 transition-colors font-mono text-xs"
            >
              JSON
            </a>
            <span className="flex items-center gap-1.5 text-xs text-white/40">
              <span
                aria-hidden
                className={`inline-block w-2 h-2 rounded-full ${
                  health === 'ok'
                    ? 'bg-green-400'
                    : health === 'error'
                    ? 'bg-red-400'
                    : 'bg-yellow-400 animate-pulse'
                }`}
              />
              <span className="hidden sm:inline">
                {health === 'ok' ? 'Live' : health === 'error' ? 'Down' : '…'}
              </span>
            </span>
          </nav>

          <div className="md:hidden" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
              className="p-2 hover:bg-white/5 rounded-lg"
            >
              <span aria-hidden className="block w-5 space-y-1">
                <span className="block h-0.5 bg-white/60" />
                <span className="block h-0.5 bg-white/60" />
                <span className="block h-0.5 bg-white/60" />
              </span>
            </button>
            {menuOpen && (
              <div className="absolute right-2 top-14 w-56 glass-card p-2 z-50">
                {navItems.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="block px-3 py-2 text-sm rounded hover:bg-white/5"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="border-t border-white/5 my-1" />
                <Link
                  to="/about"
                  className="block px-3 py-2 text-sm rounded hover:bg-white/5"
                >
                  About
                </Link>
                <Link
                  to="/help-center"
                  className="block px-3 py-2 text-sm rounded hover:bg-white/5"
                >
                  Help Center
                </Link>
                <Link
                  to="/contact"
                  className="block px-3 py-2 text-sm rounded hover:bg-white/5"
                >
                  Contact
                </Link>
                <Link
                  to="/sign-in"
                  className="block px-3 py-2 text-sm rounded hover:bg-white/5"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
