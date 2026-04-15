'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, 
    Save, 
    Loader2, 
    Newspaper,
    Type,
    Link as LinkIcon,
    FileSearch,
    Text,
    ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

export default function CreateBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    metaTitle: '',
    metaDescription: '',
    content: '',
    thumbnail: ''
  });
  const [imageLoadError, setImageLoadError] = useState(false);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 100);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Character limits checking
    if (name === 'slug' || name === 'metaTitle') {
        if (value.length > 100) return;
    }
    if (name === 'metaDescription') {
        if (value.length > 200) return;
    }

    if (name === 'thumbnail') {
      setImageLoadError(false);
    }

    setFormData(prev => {
      let finalValue = value;
      if (name === 'slug') {
        finalValue = generateSlug(value);
      }

      const newData = { ...prev, [name]: finalValue };
      
      // Auto-generate slug and meta title if the title is being changed
      if (name === 'title') {
        newData.slug = generateSlug(value);
        newData.metaTitle = value.slice(0, 100);
      }
      
      return newData;
    });
  };

  const handleImageError = () => {
    setImageLoadError(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        toast.success('Blog post created successfully!');
        router.push('/admin/blogs');
      } else {
        toast.error(data.message || 'Failed to create blog post');
      }
    } catch (error) {
      toast.error('An error occurred while creating the blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/blogs">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Blogs
          </Button>
        </Link>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-primary" />
          Create New Blog
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Type className="h-4 w-4" /> Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Blog Title *</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter short, catchy title"
                    required
                    className="h-12 text-lg font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Slug / URL path *</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">janopriyo.shop/blog/</span>
                    <Input
                      name="slug"
                      value={formData.slug}
                      onChange={handleChange}
                      placeholder="url-friendly-slug"
                      required
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="flex justify-end">
                    <span className={`text-[10px] ${formData.slug.length > 90 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {formData.slug.length}/100
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Content *</label>
                  <Textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    placeholder="Write your blog content here... (Plain Text)"
                    required
                    className="min-h-[400px] leading-relaxed"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" /> Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Thumbnail URL</label>
                  <Input
                    name="thumbnail"
                    value={formData.thumbnail}
                    onChange={handleChange}
                    placeholder="https://imgbb.com/..."
                  />
                </div>
                {formData.thumbnail && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted border">
                        <img 
                            src={imageLoadError ? 'https://placehold.co/400x225?text=Invalid+Image+URL' : formData.thumbnail} 
                            alt="Preview" 
                            className="w-full h-full object-cover"
                            onError={handleImageError}
                        />
                    </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
                    <FileSearch className="h-4 w-4" /> SEO Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Meta Title *</label>
                  <Input
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleChange}
                    placeholder="SEO friendly title"
                    required
                  />
                  <div className="flex justify-end">
                    <span className={`text-[10px] ${formData.metaTitle.length > 90 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {formData.metaTitle.length}/100
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Meta Description *</label>
                  <Textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleChange}
                    placeholder="Short description for Google search results..."
                    required
                    className="h-24 resize-none"
                  />
                  <div className="flex justify-end">
                    <span className={`text-[10px] ${formData.metaDescription.length > 180 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {formData.metaDescription.length}/200
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full h-12 font-black text-lg gap-2 shadow-lg shadow-primary/20" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Publish Post
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
