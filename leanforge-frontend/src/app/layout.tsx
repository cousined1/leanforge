import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CookieConsent } from '@/components/CookieConsent';
import { JsonLd, organizationLd, websiteLd } from '@/components/JsonLd';
import { siteConfig } from '@/lib/site';
import { AuthProvider } from '@/components/AuthProvider';
import { GoogleTagManager } from '@/components/GoogleTagManager';

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    template: `%s | ${siteConfig.shortName}`,
    default: siteConfig.name,
  },
  description: siteConfig.description,
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: siteConfig.locale,
    type: 'website',
    images: [
      {
        url: siteConfig.og.image,
        width: siteConfig.og.imageWidth,
        height: siteConfig.og.imageHeight,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: siteConfig.twitter.card,
    site: siteConfig.twitter.site,
    creator: siteConfig.twitter.creator,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.og.image],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background">
        <JsonLd data={organizationLd()} />
        <JsonLd data={websiteLd()} />
        <AuthProvider>
          <GoogleTagManager />
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  );
}
