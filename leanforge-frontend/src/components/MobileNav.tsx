'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut, User, Home } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { routes, headerNavRoutes } from '@/lib/routes';
import { regentPartnerUrl } from '@/lib/site';

function isActive(pathname: string, routePath: string): boolean {
  if (routePath === '/') return pathname === '/';
  return pathname === routePath || pathname.startsWith(`${routePath}/`);
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  return (
    <>
      <button
        type="button"
        className="md:hidden p-2 hover:bg-muted rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {open && (
        <div className="absolute top-16 inset-x-0 bg-background border-b shadow-lg md:hidden">
          <nav className="container py-4" aria-label="Mobile navigation">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    pathname === '/'
                      ? 'text-foreground font-medium bg-muted'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  aria-current={pathname === '/' ? 'page' : undefined}
                >
                  <Home className="w-4 h-4" aria-hidden="true" />
                  Home
                </Link>
              </li>
              {headerNavRoutes.map((key) => {
                const route = routes[key];
                const active = isActive(pathname, route.path);
                return (
                  <li key={key}>
                    <Link
                      href={route.path}
                      onClick={() => setOpen(false)}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        active
                          ? 'text-foreground font-medium bg-muted'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                      aria-current={active ? 'page' : undefined}
                    >
                      {route.shortLabel || route.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="border-t mt-3 pt-3 space-y-2">
              {loading ? (
                <div className="h-9 rounded-lg bg-muted animate-pulse" />
              ) : user ? (
                <div className="px-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" aria-hidden="true" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { signOut(); setOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground w-full rounded-lg hover:bg-muted/50 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="px-3 space-y-2">
                  <a
                    href={regentPartnerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 text-sm btn-primary text-center rounded-lg"
                  >
                    Try SEO AI Regent
                  </a>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
