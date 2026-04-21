'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    ExternalLink, 
    Loader2,
    Newspaper,
    DatabaseZap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import Image from 'next/image';

interface BlogListItem {
  _id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  createdAt: string;
  isPublished: boolean;
}

export default function ManageBlogsPage() {
  const [blogs, setBlogs] = useState<BlogListItem[]>([]);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBlogs = async () => {
    try {
      const res = await fetch('/api/admin/blogs');
      const data = await res.json();
      if (res.ok) {
        setBlogs(data);
      } else {
        toast.error(data.message || 'Failed to fetch blogs');
      }
    } catch {
      toast.error('An error occurred while fetching blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00D1B2',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`/api/admin/blogs/${id}`, { method: 'DELETE' });
        if (res.ok) {
          toast.success('Blog deleted successfully');
          fetchBlogs();
        } else {
          const data = await res.json();
          toast.error(data.message || 'Failed to delete blog');
        }
      } catch {
        toast.error('An error occurred while deleting the blog');
      }
    }
  };

  const filteredBlogs = blogs.filter(blog => 
    (blog.title?.toLowerCase() ?? '').includes(searchQuery.toLowerCase())
  );

  const handleSeedDemoData = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/admin/seed-demo', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Failed to seed demo data');
        return;
      }
      toast.success(`Seeded ${data.blogsInserted} blogs and ${data.productsInserted} products.`);
      fetchBlogs();
    } catch {
      toast.error('Failed to seed demo data');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 pt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Newspaper className="h-6 w-6 text-primary" />
            Manage Blogs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, edit, and manage your store&apos;s blog posts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handleSeedDemoData} disabled={seeding}>
            {seeding ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <DatabaseZap className="mr-2 h-4 w-4" />
            )}
            Seed Demo Data
          </Button>
          <Link href="/admin/blogs/new">
            <Button className="font-bold">
              <Plus className="mr-2 h-4 w-4" /> Create Blog
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blogs..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold">Thumbnail</TableHead>
              <TableHead className="font-bold">Title</TableHead>
              <TableHead className="font-bold">Status</TableHead>
              <TableHead className="font-bold">Date</TableHead>
              <TableHead className="text-right font-bold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span>Loading blogs...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredBlogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No blogs found.
                </TableCell>
              </TableRow>
            ) : (
              filteredBlogs.map((blog) => (
                <TableRow key={blog._id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="h-10 w-16 bg-muted rounded overflow-hidden relative">
                      {blog.thumbnail ? (
                        <Image
                          src={imageErrors[blog._id] ? 'https://placehold.co/400x225?text=Invalid+Image+URL' : blog.thumbnail}
                          alt={blog.title}
                          fill
                          className="object-cover"
                          onError={() =>
                            setImageErrors((prev) => ({ ...prev, [blog._id]: true }))
                          }
                          unoptimized
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-[10px] text-muted-foreground">No Img</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-sm max-w-[300px] truncate">{blog.title}</div>
                    <div className="text-[10px] text-muted-foreground font-mono truncate max-w-[300px]">/{blog.slug}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={blog.isPublished ? 'default' : 'secondary'}>
                      {blog.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/blog/${blog.slug}`} target="_blank">
                        <Button variant="ghost" size="icon-sm" title="View Publicly">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/blogs/edit/${blog._id}`}>
                        <Button variant="outline" size="icon-sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="destructive" 
                        size="icon-sm" 
                        onClick={() => handleDelete(blog._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
