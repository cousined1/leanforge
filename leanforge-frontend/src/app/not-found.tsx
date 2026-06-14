import Link from 'next/link';
import { Home, Search, BookOpen, CreditCard, FileSearch } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="container max-w-lg text-center py-16">
        <div className="text-6xl font-bold text-primary mb-4" aria-hidden="true">404</div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto mb-6">
          <Link
            href="/"
            className="btn-primary px-4 py-2 text-sm inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Go Home
          </Link>
          <Link
            href="/keywords"
            className="btn-outline px-4 py-2 text-sm inline-flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            Browse Keywords
          </Link>
          <Link
            href="/use-cases"
            className="btn-outline px-4 py-2 text-sm inline-flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4" aria-hidden="true" />
            See Use Cases
          </Link>
          <Link
            href="/pricing"
            className="btn-outline px-4 py-2 text-sm inline-flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" aria-hidden="true" />
            View Pricing
          </Link>
        </div>
        <div className="pt-6 border-t text-sm text-muted-foreground space-y-2">
          <p>
            <FileSearch className="w-4 h-4 inline-block align-text-bottom mr-1" aria-hidden="true" />
            Need help?{' '}
            <Link href="/contact" className="text-primary hover:underline">Contact us</Link>
            {' '}or{' '}
            <Link href="/help-center" className="text-primary hover:underline">visit our Help Center</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
