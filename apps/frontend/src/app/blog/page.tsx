import type { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts } from '../../lib/blogData';

export const metadata: Metadata = {
  title: 'Internet Speed & Broadband Guides',
  description:
    'Expert guides on internet speed, broadband types, troubleshooting slow connections, and getting the most from your network.',
  alternates: { canonical: 'https://speedtest.chghulamnabi.com/blog' },
};

export default function BlogPage() {
  return (
    <>
      <div className="bg-scene">
        <div className="stars" />
        <div className="grid-floor" />
      </div>

      <div className="page" style={{ justifyContent: 'flex-start', paddingTop: 80 }}>
        {/* Header */}
        <header className="header" style={{ marginBottom: 8 }}>
          <Link href="/" className="blog-back">← Speed Test</Link>
          <div className="header-title" style={{ marginTop: 16 }}>Guides & Resources</div>
          <div className="header-sub">Internet speed tips, comparisons, and troubleshooting</div>
        </header>

        {/* Ad slot — top of blog */}
        <div className="ad-slot ad-slot--horizontal" aria-label="Advertisement">
          <ins className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX"
            data-ad-slot="1234567890"
            data-ad-format="auto"
            data-full-width-responsive="true" />
        </div>

        {/* Post grid */}
        <div className="blog-grid">
          {blogPosts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
              <span className="blog-card__cat">{post.category}</span>
              <h2 className="blog-card__title">{post.title}</h2>
              <p className="blog-card__desc">{post.description}</p>
              <div className="blog-card__meta">
                <span>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                <span>{post.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
