'use client';

import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  createdAt: string | Date;
  metaDescription?: string;
}

interface BlogRecentProps {
  blogs: Blog[];
}

export function BlogRecent({ blogs }: BlogRecentProps) {
  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="py-20">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16 space-y-4">
            <Badge variant="outline" className="px-4 py-1 border-primary/30 text-primary font-bold tracking-widest uppercase text-[10px]">
                The Journal
            </Badge>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                Latest from our <span className="text-primary italic">Blog</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
                Discover tips, news, and trends from the Janopriyo Shop community.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {blogs.map((blog) => (
                <Link 
                    key={blog._id} 
                    href={`/blog/${blog.slug}`}
                    className="group flex flex-col bg-card border rounded-[2rem] overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
                >
                    <div className="aspect-[16/10] overflow-hidden bg-muted relative">
                        {blog.thumbnail ? (
                            <img 
                                src={blog.thumbnail} 
                                alt={blog.title} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-20">No Image</div>
                        )}
                    </div>
                    <div className="p-8">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(blog.createdAt), 'MMMM dd, yyyy')}
                        </div>
                        <h3 className="text-xl font-black leading-tight mb-4 group-hover:text-primary transition-colors">
                            {blog.title}
                        </h3>
                        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                            {blog.metaDescription}
                        </p>
                    </div>
                </Link>
            ))}
        </div>

        <div className="text-center">
            <Link 
                href="/blog"
                className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), "rounded-full px-8 font-bold group")}
            >
                View All Stories <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
        </div>
      </div>
    </section>
  );
}
