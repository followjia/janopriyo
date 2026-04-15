'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Calendar, 
    ArrowRight, 
    Loader2,
    Newspaper
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function BlogListingPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch('/api/blogs');
        if (res.ok) {
          const data = await res.json();
          setBlogs(data);
        }
      } catch (error) {
        console.error('Failed to fetch blogs');
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  return (
    <div className="container mx-auto px-4 py-20 max-w-7xl">
      <div className="space-y-4 mb-16 text-center">
        <Badge variant="outline" className="px-4 py-1 border-primary/30 text-primary font-bold tracking-widest uppercase text-[10px]">
           Our Journal
        </Badge>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
          Latest Stories & <span className="text-primary italic">Updates</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Deep dives into our products, company culture, and the latest trends in ecommerce.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-bold text-muted-foreground">Loading our latest stories...</p>
        </div>
      ) : blogs.length === 0 ? (
         <div className="text-center py-20 bg-muted/30 rounded-3xl border border-dashed border-border/50">
            <Newspaper className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h2 className="text-xl font-bold">No posts found</h2>
            <p className="text-muted-foreground">Check back later for new content!</p>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
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
                <div className="absolute top-4 left-4">
                   <Badge className="bg-white/80 backdrop-blur-md text-black border-none font-bold text-[10px] shadow-sm">
                      LATEST
                   </Badge>
                </div>
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
  );
}
