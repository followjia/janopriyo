import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Blog from '@/models/Blog';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Fetch all blogs sorted by latest
    const blogs = await Blog.find({}).sort({ createdAt: -1 });

    return NextResponse.json(blogs);
  } catch (error: any) {
    console.error('Error fetching blogs collection:', error);
    if (error.stack) console.error(error.stack);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
