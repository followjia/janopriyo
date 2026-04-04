import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Review from '@/models/Review';
import Product from '@/models/Product';
import { auth } from '@/auth';

// Update review status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    await connectToDatabase();
    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    const oldStatus = review.status;
    review.status = status;
    await review.save();

    // If status changed to/from 'approved', recalculate product ratings
    if (oldStatus === 'approved' || status === 'approved') {
      const productId = review.product;
      const approvedReviews = await Review.find({ 
        product: productId, 
        status: 'approved' 
      });

      const numReviews = approvedReviews.length;
      const ratings = numReviews > 0 
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / numReviews 
        : 0;

      await Product.findByIdAndUpdate(productId, {
        ratings,
        numReviews
      });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error('Update Review Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Delete review
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const review = await Review.findById(id);

    if (!review) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    const productId = review.product;
    const wasApproved = review.status === 'approved';

    await Review.findByIdAndDelete(id);

    // If deleted review was approved, recalculate product ratings
    if (wasApproved) {
      const approvedReviews = await Review.find({ 
        product: productId, 
        status: 'approved' 
      });

      const numReviews = approvedReviews.length;
      const ratings = numReviews > 0 
        ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / numReviews 
        : 0;

      await Product.findByIdAndUpdate(productId, {
        ratings,
        numReviews
      });
    }

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete Review Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
