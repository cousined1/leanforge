import { Helmet } from 'react-helmet-async';
import {
  SITE_NAME,
  SITE_SHORT_NAME,
  SITE_URL,
  SITE_LOCALE,
  OG_IMAGE,
  OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT,
  TWITTER_HANDLE,
  absoluteUrl,
  type SeoParams,
} from '../lib/site';

export function Seo({
  title,
  description,
  path = '/',
  image,
  noindex = false,
  ogType = 'website',
  jsonLd,
}: SeoParams) {
  const resolvedTitle =
    title === SITE_NAME ? title : `${title} | ${SITE_SHORT_NAME}`;
  const resolvedDescription = description ?? '';
  const resolvedUrl = absoluteUrl(path);
  const resolvedImage = image ?? OG_IMAGE;

  return (
    <Helmet>
      <title>{resolvedTitle}</title>
      <meta name="description" content={resolvedDescription} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={resolvedUrl} />

      <meta property="og:title" content={resolvedTitle} />
      <meta property="og:description" content={resolvedDescription} />
      <meta property="og:url" content={resolvedUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content={SITE_LOCALE} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
      <meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:title" content={resolvedTitle} />
      <meta name="twitter:description" content={resolvedDescription} />
      <meta name="twitter:image" content={resolvedImage} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(
            Array.isArray(jsonLd)
              ? jsonLd
              : {
                  '@context': 'https://schema.org',
                  ...jsonLd,
                }
          )}
        </script>
      )}
    </Helmet>
  );
}

export function organizationLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    email: 'hello@developer312.com',
    telephone: '+15104011225',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'hello@developer312.com',
      telephone: '+15104011225',
    },
    parentOrganization: {
      '@type': 'Organization',
      name: 'Developer312',
      legalName: 'NIGHT LITE USA LLC',
    },
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/keyword/{search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function webPageLd(url: string, name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    url,
    name,
    description,
  };
}

export function breadcrumbLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
