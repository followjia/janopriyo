import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Blog from '@/models/Blog';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Show only published blogs publicly, newest first
    const blogs = await Blog.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .select('title slug metaDescription thumbnail createdAt');

    return NextResponse.json(blogs);
  } catch (error: unknown) {
    console.error('Error fetching blogs collection:', error);
    if (error instanceof Error && error.stack) console.error(error.stack);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
