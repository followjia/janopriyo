import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShareButtons } from '@/components/storefront/ShareButtons';
import Image from 'next/image';
import { generateHtml } from '@/lib/server-html';

interface BlogDetailProps {
  params: Promise<{ slug: string }>;
}

interface BlogDetail {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  thumbnail?: string;
  content: string;
  createdAt: string | Date;
}

const getReadingTime = (rawContent: string) => {
  const html = generateHtml(rawContent);
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = text ? text.split(' ').length : 0;
  return Math.max(1, Math.ceil(words / 220));
};

import { BlogDetailsSelector } from '@/components/templates/ServerRegistry';
import { getCachedBlogBySlug, getCachedSettings } from '@/lib/data-fetching';
import { getTenantDomain } from '@/lib/tenant';

async function getBlog(domain: string, slug: string) {
  return getCachedBlogBySlug(domain, slug);
}

export async function generateMetadata({ params }: BlogDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const domain = await getTenantDomain();
  const blog = await getBlog(domain, slug);

  if (!blog) return { title: 'Blog Not Found' };

  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription,
    openGraph: {
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription,
      images: blog.thumbnail ? [blog.thumbnail] : [],
      type: 'article',
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailProps) {
  const { slug } = await params;
  const domain = await getTenantDomain();
  const headersList = await headers();
  const hostname = headersList.get('host') || 'localhost';

  const [blog, settings] = await Promise.all([
    getBlog(domain, slug),
    getCachedSettings(hostname)
  ]);

  if (!blog) notFound();
  const readingTime = getReadingTime(blog.content);
  const style = settings?.uiTemplates?.blogDetail || 'v1';

  return (
    <BlogDetailsSelector 
      style={style} 
      blog={blog} 
      readingTime={readingTime} 
    />
  );
}
