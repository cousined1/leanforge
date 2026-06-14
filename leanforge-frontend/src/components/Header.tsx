'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Search, User } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { routes, headerNavRoutes } from '@/lib/routes';
import { regentPartnerUrl } from '@/lib/site';

function isActive(pathname: string, routePath: string): boolean {
  if (routePath === '/') return pathname === '/';
  return pathname === routePath || pathname.startsWith(`${routePath}/`);
}

export function Header() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2" aria-label="LeanForge home">
          <div className="h-8 w-8 rounded-lg bg-primary" />
          <span className="font-semibold text-lg">LeanForge</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {headerNavRoutes.map((key) => {
            const route = routes[key];
            const active = isActive(pathname, route.path);
            return (
              <Link
                key={key}
                href={route.path}
                className={`text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded ${
                  active
                    ? 'text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {route.shortLabel || route.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/keywords"
            className="p-2 hover:bg-muted rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Search keywords"
          >
            <Search className="w-5 h-5" />
          </Link>
          {loading ? (
            <div className="h-9 w-24 rounded-lg bg-muted animate-pulse" />
          ) : user ? (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="max-w-40 truncate">{user.email}</span>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="btn-outline px-3 py-2 text-sm gap-2"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <Link
              href={routes.signIn.path}
              className="btn-outline px-3 py-2 text-sm hidden sm:inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-current={isActive(pathname, routes.signIn.path) ? 'page' : undefined}
            >
              Sign in
            </Link>
          )}
          <a
            href={regentPartnerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary px-4 py-2 text-sm hidden md:inline-block"
          >
            Try SEO AI Regent
          </a>
          <Link
            href={routes.signIn.path}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Sign in"
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
