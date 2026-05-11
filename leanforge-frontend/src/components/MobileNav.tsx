'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LogOut, User, Home } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { routes, headerNavRoutes } from '@/lib/routes';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  return (
    <>
      <button
        type="button"
        className="md:hidden p-2 hover:bg-muted rounded-lg transition"
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
              {headerNavRoutes.map((key) => {
                const route = routes[key];
                const isActive = pathname === route.path;
                return (
                  <li key={key}>
                    <Link
                      href={route.path}
                      onClick={() => setOpen(false)}
                      className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'text-foreground font-medium bg-muted'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
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
                    <User className="w-4 h-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { signOut(); setOpen(false); }}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground w-full rounded-lg hover:bg-muted/50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="px-3 space-y-2">
                  <Link
                    href="/sign-in"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="https://seo-ai-regent.com/?ref=keyword-trend-api"
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 text-sm btn-primary text-center rounded-lg"
                  >
                    Start Free Trial
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}