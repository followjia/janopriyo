import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/auth';

// POST sync local wishlist with database
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { productIds } = await req.json();

    if (!Array.isArray(productIds)) {
      return NextResponse.json({ message: 'productIds must be an array' }, { status: 400 });
    }

    const MAX_PRODUCT_IDS = 100;
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;

    const validProductIds = productIds
      .map((id: any) => (typeof id === 'string' ? id.trim() : ''))
      .filter((id: string) => id !== '' && objectIdRegex.test(id));

    if (validProductIds.length > MAX_PRODUCT_IDS) {
      return NextResponse.json({ message: `Maximum ${MAX_PRODUCT_IDS} product IDs allowed` }, { status: 400 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    // Merge logic: Add IDs from validProductIds if they are not already in user.wishlist
    validProductIds.forEach((id: string) => {
      if (!user.wishlist.some((existingId: any) => existingId.toString() === id)) {
        user.wishlist.push(id as any);
      }
    });

    await user.save();
    return NextResponse.json(user.wishlist);
  } catch (error) {
    console.error('Error syncing wishlist:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
