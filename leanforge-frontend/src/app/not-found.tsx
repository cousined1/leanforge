import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="container max-w-lg text-center py-16">
        <div className="text-6xl font-bold text-primary mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="btn-primary px-4 py-2 text-sm inline-flex items-center gap-2">
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link href="/keywords" className="btn-outline px-4 py-2 text-sm inline-flex items-center gap-2">
            <Search className="w-4 h-4" />
            Browse Keywords
          </Link>
          <Link href="/pricing" className="btn-outline px-4 py-2 text-sm inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            View Pricing
          </Link>
        </div>
        <div className="mt-8 pt-6 border-t text-sm text-muted-foreground">
          <p>Need help? <Link href="/contact" className="text-primary hover:underline">Contact us</Link> or <Link href="/help-center" className="text-primary hover:underline">visit our Help Center</Link>.</p>
        </div>
      </div>
    </div>
  );
}