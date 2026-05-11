import { Metadata } from 'next';
import { siteConfig, absoluteUrl } from './site';

interface MetadataParams {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noindex?: boolean;
  ogType?: 'website' | 'article';
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  noindex = false,
  ogType = 'website',
}: MetadataParams): Metadata {
  const resolvedTitle = `${title} | ${siteConfig.shortName}`;
  const resolvedImage = image || siteConfig.og.image;
  const resolvedUrl = path ? absoluteUrl(path) : siteConfig.url;

  return {
    title: resolvedTitle,
    description,
    ...(noindex && { robots: { index: false, follow: false } }),
    alternates: {
      canonical: resolvedUrl,
    },
    openGraph: {
      title: resolvedTitle,
      description,
      url: resolvedUrl,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: ogType,
      images: [
        {
          url: resolvedImage,
          width: siteConfig.og.imageWidth,
          height: siteConfig.og.imageHeight,
          alt: resolvedTitle,
        },
      ],
    },
    twitter: {
      card: siteConfig.twitter.card,
      site: siteConfig.twitter.site,
      creator: siteConfig.twitter.creator,
      title: resolvedTitle,
      description,
      images: [resolvedImage],
    },
  };
}

export function defaultMetadata(): Metadata {
  return buildMetadata({
    title: siteConfig.name,
    description: siteConfig.description,
    path: '/',
  });
}

export function withFallbackTitle(title: string, fallback: string): string {
  return title || fallback;
}
