import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Blog from '@/models/Blog';
import { auth } from '@/auth';

// GET all blogs for admin
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const blogs = await Blog.find({}).sort({ createdAt: -1 });
    return NextResponse.json(blogs);
  } catch (error: any) {
    console.error('[Admin Blog List GET] error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create a new blog
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    await connectToDatabase();

    // Basic server-side validation for slug uniqueness
    const existingBlog = await Blog.findOne({ slug: body.slug });
    if (existingBlog) {
      return NextResponse.json({ message: 'A blog with this slug already exists' }, { status: 400 });
    }

    // Whitelist allowed fields to prevent mass-assignment
    const blogData = {
      title: body.title,
      slug: body.slug,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      content: body.content,
      thumbnail: body.thumbnail,
      isPublished: body.isPublished ?? true
    };

    const blog = await Blog.create(blogData);
    return NextResponse.json(blog, { status: 201 });
  } catch (error: any) {
    console.error('[Admin Blog Create POST] error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
