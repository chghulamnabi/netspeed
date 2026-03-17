import type { MetadataRoute } from 'next';
import { blogPosts } from '../lib/blogData';

const SITE_URL = 'https://speedtest.chghulamnabi.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const blogRoutes = blogPosts.map(post => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...blogRoutes,
  ];
}
