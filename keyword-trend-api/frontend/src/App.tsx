import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import { CookieConsent } from './components/CookieConsent';
import { organizationLd, websiteLd } from './components/Seo';
import Home from './pages/Home';
import KeywordDetail from './pages/KeywordDetail';
import CategoryListing from './pages/CategoryListing';
import Pricing from './pages/Pricing';
import Features from './pages/Features';
import Faq from './pages/Faq';
import About from './pages/About';
import Contact from './pages/Contact';
import HelpCenter from './pages/HelpCenter';
import ApiDocs from './pages/ApiDocs';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import Disclaimer from './pages/Disclaimer';
import SignIn from './pages/SignIn';
import AuthCallback from './pages/AuthCallback';
import ToolsIndex from './pages/tools/ToolsIndex';
import ToolPage from './pages/tools/ToolPage';
import BillingSuccess from './pages/BillingSuccess';
import BillingCanceled from './pages/BillingCanceled';
import NotFound from './pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function StructuredData() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd()) }}
      />
    </>
  );
}

export default function App() {
  return (
    <Layout>
      <StructuredData />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/keyword/:slug" element={<KeywordDetail />} />
        <Route path="/category/:slug" element={<CategoryListing />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help-center" element={<HelpCenter />} />
        <Route path="/api-docs" element={<ApiDocs />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/billing/success" element={<BillingSuccess />} />
        <Route path="/billing/canceled" element={<BillingCanceled />} />
        <Route path="/tools" element={<ToolsIndex />} />
        <Route path="/tools/:slug" element={<ToolPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <CookieConsent />
    </Layout>
  );
}
