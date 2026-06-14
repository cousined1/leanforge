import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { PageContainer } from '../components/Breadcrumbs';

export default function NotFound() {
  return (
    <>
      <Seo
        title="Page Not Found"
        description="The page you're looking for doesn't exist or has been moved."
        path="/404"
        noindex
      />
      <PageContainer>
        <section className="max-w-lg mx-auto text-center space-y-6 py-12">
          <div className="text-6xl sm:text-7xl font-extrabold gradient-text">404</div>
          <h1 className="text-2xl font-bold">Page not found</h1>
          <p className="text-sm text-white/50">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/" className="btn-primary text-sm">
              ← Back to trending
            </Link>
            <Link to="/api-docs" className="btn-outline text-sm">
              API Docs
            </Link>
            <Link to="/contact" className="btn-outline text-sm">
              Contact
            </Link>
          </div>
        </section>
      </PageContainer>
    </>
  );
}
