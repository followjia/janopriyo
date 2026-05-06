import { Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShareButtons } from '@/components/storefront/ShareButtons';
import Image from 'next/image';
import { generateHtml } from '@/lib/server-html';
import FloatingLines from '@/components/ui/FloatingLines';

export default function BlogDetailsV1({ blog, readingTime }: { blog: any, readingTime: number }) {
  if (!blog) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Cinematic Hero Header */}
      <header className="relative pt-12 pb-20 overflow-hidden border-b bg-muted/20">
        {/* Floating Lines Background */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
          <FloatingLines
            enabledWaves={["top", "middle", "bottom"]}
            lineCount={12}
            lineDistance={10}
            bendRadius={5}
            bendStrength={-1.5}
            interactive={true}
            parallax={true}
            animationSpeed={0.8}
            linesGradient={['var(--primary)', 'var(--primary)']}
            mixBlendMode="normal"
          />
        </div>

        <div className="container mx-auto px-4 max-w-4xl relative z-10">
          <Link href="/blog">
            <Button variant="ghost" className="mb-8 gap-2 -ml-4 hover:bg-transparent hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Button>
          </Link>
          <div className="space-y-6 mb-12 p-8 md:p-12 rounded-[2.5rem] bg-background/40 backdrop-blur-xl border border-border/50 shadow-2xl shadow-primary/5 relative overflow-hidden group">
            {/* Subtle inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 pointer-events-none" />
            
            <h1 className="text-4xl md:text-6xl text-primary font-black tracking-tighter leading-[1.1] relative z-10">
              {blog.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 pt-4 text-muted-foreground relative z-10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                <Calendar className="h-4 w-4 text-primary" />
                {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="h-1 w-1 rounded-full bg-border" />
              <div className="text-xs font-bold uppercase tracking-widest">
                {readingTime} min read
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Featured Image */}
          {blog.thumbnail && (
            <div className="mb-16 -mt-40 relative z-20 shadow-2xl rounded-[2.5rem] overflow-hidden border border-border/50 aspect-[16/9] shadow-primary/10">
              <Image
                src={blog.thumbnail}
                alt={blog.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar / Tools */}
            <aside className="lg:w-16 flex lg:flex-col items-center gap-4 lg:sticky lg:top-32 h-fit order-2 lg:order-1">
              <ShareButtons title={blog.title} />
            </aside>

            {/* Content Body */}
            <article className="flex-1 order-1 lg:order-2">
              <div className="prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-muted-foreground prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-strong:text-foreground">
                <div
                  className="ProseMirror prose prose-lg dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:text-muted-foreground prose-headings:font-black prose-headings:tracking-tight prose-a:text-primary prose-strong:text-foreground min-h-[400px]"
                  dangerouslySetInnerHTML={{ __html: generateHtml(blog.content) }}
                />
              </div>

              <footer className="mt-16 pt-8 border-t">
                <div className="p-8 rounded-3xl bg-muted/30 border flex flex-col items-center text-center gap-4">
                  <h3 className="font-bold">Enjoyed this post?</h3>
                  <p className="text-sm text-muted-foreground">Share it with your network and join the conversation.</p>
                  <Link href="/blog">
                    <Button className="mt-2 font-bold px-8 rounded-full">Explore More Stories</Button>
                  </Link>
                </div>
              </footer>
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
