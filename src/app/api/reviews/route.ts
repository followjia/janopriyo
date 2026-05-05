import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Review from '@/models/Review';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { auth } from '@/auth';
import { z } from 'zod';
import { getTenantDomain } from '@/lib/tenant';

const reviewSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, 'Comment must be at least 5 characters long').max(1000, 'Comment too long'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'You must be logged in to review' }, { status: 401 });
    }

    const body = await req.json();
    const validation = reviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        message: 'Validation failed', 
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { productId, rating, comment } = validation.data;
    const userId = (session.user as any).id;

    await connectToDatabase();
    const domain = await getTenantDomain();
    if (!domain) {
      return NextResponse.json({ message: 'Tenant domain is missing' }, { status: 400 });
    }

    // 1. STRICT VERIFICATION: Check if user has a DELIVERED order for this product
    // And ensure the order was placed while logged in (user field matches)
    const deliveredOrder = await Order.findOne({
      user: userId,
      'items.product': productId,
      status: 'Delivered',
      domain, // Add domain check
    });

    if (!deliveredOrder) {
      return NextResponse.json({ 
        message: 'Review denied. You can only review products from a delivered order placed while logged in.' 
      }, { status: 403 });
    }

    // 2. Check if user already reviewed this product on this domain
    const existingReview = await Review.findOne({ user: userId, product: productId, domain });
    if (existingReview) {
      return NextResponse.json({ message: 'You have already reviewed this product' }, { status: 400 });
    }

    // 3. Create the review (defaults to pending)
    const newReview = await Review.create({
      product: productId,
      user: userId,
      name: session.user.name || 'Anonymous',
      rating,
      comment,
      domain, // MUST set domain
      status: 'pending',
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error('Submit Review Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// GET approved reviews for a product
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    await connectToDatabase();
    const domain = await getTenantDomain();
    if (!domain) {
      return NextResponse.json({ message: 'Tenant domain is missing' }, { status: 400 });
    }
    const reviews = await Review.find({ 
      product: productId, 
      status: 'approved',
      domain, // Filter by domain
    })
    .sort({ createdAt: -1 })
    .populate('user', 'name image');

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Fetch Reviews Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
