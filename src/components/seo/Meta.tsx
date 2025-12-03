/**
 * Meta Component
 * 
 * SEO metadata component with Open Graph and Twitter Card support
 */

import Head from 'next/head';

export interface MetaProps {
  title: string;
  description: string;
  url: string;
  ogImage?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  tags?: string[];
}

export default function Meta({
  title,
  description,
  url,
  ogImage = '/og-image.png',
  type = 'website',
  publishedTime,
  tags = [],
}: MetaProps) {
  const siteName = 'Microblog CMS';
  const fullTitle = `${title} | ${siteName}`;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />

      {/* Open Graph Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />

      {/* Article Specific Tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && tags.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* JSON-LD Structured Data */}
      {type === 'article' && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BlogPosting',
              headline: title,
              description: description,
              url: url,
              datePublished: publishedTime,
              keywords: tags.join(', '),
              author: {
                '@type': 'Person',
                name: siteName,
              },
            }),
          }}
        />
      )}
    </Head>
  );
}
