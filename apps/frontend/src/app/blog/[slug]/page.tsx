import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import { blogPosts } from '../../../lib/blogData';
import AdUnit from '../../../components/AdUnit';

const SITE_URL = 'https://speedtest.chghulamnabi.com';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return blogPosts.map(p => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const post = blogPosts.find(p => p.slug === params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      url: `${SITE_URL}/blog/${post.slug}`,
      title: post.title,
      description: post.description,
      publishedTime: post.date,
      authors: ['SpeedTest'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = blogPosts.find(p => p.slug === params.slug);
  if (!post) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: 'SpeedTest', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'SpeedTest', url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
  };

  const related = blogPosts.filter(p => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="bg-scene">
        <div className="stars" />
        <div className="grid-floor" />
      </div>

      <div className="page" style={{ justifyContent: 'flex-start', paddingTop: 80 }}>
        <div className="article-wrap">
          {/* Back */}
          <Link href="/blog" className="blog-back">← All Guides</Link>

          {/* Header */}
          <div className="article-cat">{post.category}</div>
          <h1 className="article-title">{post.title}</h1>
          <div className="article-meta">
            <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>

          {/* Ad — top of article */}
          <AdUnit slot="9876543210" />

          {/* Content */}
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Ad — mid article */}
          <AdUnit slot="1122334455" style={{ margin: '32px 0' }} />

          {/* CTA */}
          <div className="article-cta">
            <div className="article-cta__text">Ready to check your speed?</div>
            <Link href="/" className="article-cta__btn">Run Speed Test →</Link>
          </div>

          {/* Related posts */}
          {related.length > 0 && (
            <div className="related-section">
              <div className="related-title">Related Guides</div>
              <div className="blog-grid blog-grid--small">
                {related.map(r => (
                  <Link key={r.slug} href={`/blog/${r.slug}`} className="blog-card">
                    <span className="blog-card__cat">{r.category}</span>
                    <h3 className="blog-card__title">{r.title}</h3>
                    <div className="blog-card__meta">
                      <span>{r.readTime}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
