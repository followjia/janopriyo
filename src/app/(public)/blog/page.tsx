'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Calendar, 
    ArrowRight, 
    Newspaper,
    Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { BlogFeaturedSkeleton, BlogCardSkeleton } from '@/components/storefront/Skeletons';

interface BlogListItem {
  _id: string;
  slug: string;
  title: string;
  metaDescription?: string;
  thumbnail?: string;
  createdAt: string;
}

export default function BlogListingPage() {
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch('/api/blogs');
        if (res.ok) {
          const data = (await res.json()) as BlogListItem[];
          setBlogs(Array.isArray(data) ? data : []);
        }
      } catch {
        console.error('Failed to fetch blogs');
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter((blog) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      blog.title.toLowerCase().includes(q) ||
      (blog.metaDescription ?? '').toLowerCase().includes(q)
    );
  });

  const [featuredBlog, ...gridBlogs] = filteredBlogs;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/[0.03] via-background to-background">
      <div className="container mx-auto px-4 py-16 md:py-20 max-w-7xl">
        <div className="space-y-5 mb-12 text-center">
          <Badge variant="outline" className="px-4 py-1 border-primary/30 text-primary font-bold tracking-widest uppercase text-[10px]">
            Our Journal
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
            Latest Stories & <span className="text-primary italic">Insights</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Product ideas, commerce playbooks, and practical updates from Janopriyo Shop.
          </p>
        </div>

        <div className="mb-12 rounded-2xl border bg-card/70 backdrop-blur p-4 md:p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or topic..."
              className="pl-9"
            />
          </div>
          <p className="text-sm text-muted-foreground italic md:not-italic">
            {loading ? (
              <span className="animate-pulse">Calculating results...</span>
            ) : (
              <>Showing <span className="font-bold text-foreground">{filteredBlogs.length}</span> article{filteredBlogs.length === 1 ? '' : 's'}</>
            )}
          </p>
        </div>

        {!loading && featuredBlog && (
          <Link
            href={`/blog/${featuredBlog.slug}`}
            className="group mb-10 grid md:grid-cols-2 overflow-hidden rounded-[2rem] border bg-card hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500"
          >
            <div className="relative min-h-[260px] bg-muted">
              {featuredBlog.thumbnail ? (
                <Image
                  src={featuredBlog.thumbnail}
                  alt={featuredBlog.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <Newspaper className="h-12 w-12 text-muted-foreground/30" />
                </div>
              )}
            </div>
            <div className="p-8 md:p-10 flex flex-col justify-center">
              <Badge className="w-fit mb-4 uppercase tracking-widest text-[10px]">Featured Story</Badge>
              <h2 className="text-2xl md:text-3xl font-black leading-tight mb-4 group-hover:text-primary transition-colors">
                {featuredBlog.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed line-clamp-3 mb-6">
                {featuredBlog.metaDescription}
              </p>
              <span className="inline-flex items-center gap-2 font-bold text-primary">
                Read Article <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        )}

        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="md:col-span-2 lg:col-span-3">
              <BlogFeaturedSkeleton />
            </div>
            {[...Array(6)].map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border/50">
            <Newspaper className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold">No posts found</h2>
            <p className="text-muted-foreground">Try another keyword or check back later for new content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(featuredBlog ? gridBlogs : filteredBlogs).map((blog) => (
              <Link
                key={blog._id}
                href={`/blog/${blog.slug}`}
                className="group flex flex-col bg-card border rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2 border-border/50"
              >
                <div className="aspect-[16/10] overflow-hidden relative bg-muted">
                  {blog.thumbnail ? (
                    <Image
                      src={blog.thumbnail}
                      alt={blog.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Newspaper className="h-12 w-12 text-muted-foreground/20" />
                    </div>
                  )}
                </div>
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <h3 className="text-xl font-black leading-tight mb-4 group-hover:text-primary transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                    {blog.metaDescription}
                  </p>
                  <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read More <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
