'use client';

import Link from 'next/link';
import { Home, RefreshCw } from 'lucide-react';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="container max-w-lg text-center py-16">
        <div className="text-6xl font-bold text-destructive mb-4">Error</div>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-8">
          An unexpected error occurred. Please try again.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="btn-primary px-4 py-2 text-sm inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link href="/" className="btn-outline px-4 py-2 text-sm inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
        <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
          <p>Need help? <Link href="/help-center" className="text-primary hover:underline">Visit our Help Center</Link>.</p>
        </div>
      </div>
    </div>
  );
}