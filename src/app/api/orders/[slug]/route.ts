/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { auth } from '@/auth';

// GET single order details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!mongoose.isValidObjectId(slug)) {
      return NextResponse.json({ message: 'Invalid order ID' }, { status: 400 });
    }

    await connectToDatabase();
    const order = await Order.findById(slug)
      .populate('user', 'name email image')
      .populate('items.product', 'name price images');

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Authorization: Must be an admin OR the owner of the order
    const isAdmin = (session.user as any)?.role === 'admin';
    const isOwner = order.user?._id?.toString() === (session.user as any).id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order detail:', error);
    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json({ message: 'Invalid order ID' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH update order status (Admin Only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
    }
    const { status, paymentStatus } = body;

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(slug)) {
      return NextResponse.json({ message: 'Invalid order id' }, { status: 400 });
    }

    const order = await Order.findById(slug);

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // Update only allowed fields with validation
    const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    const allowedPaymentStatuses = ['Pending', 'Paid', 'Failed'];

    if (status) {
        if (!allowedStatuses.includes(status)) {
            return NextResponse.json({ 
                message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}` 
            }, { status: 400 });
        }
        order.status = status;
    }

    if (paymentStatus) {
        if (!allowedPaymentStatuses.includes(paymentStatus)) {
            return NextResponse.json({ 
                message: `Invalid payment status. Allowed values: ${allowedPaymentStatuses.join(', ')}` 
            }, { status: 400 });
        }
        order.paymentStatus = paymentStatus;
    }

    await order.save();

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE order (Admin Only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const session = await auth();
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (!mongoose.Types.ObjectId.isValid(slug)) {
      return NextResponse.json({ message: 'Invalid order ID' }, { status: 400 });
    }

    await connectToDatabase();
    const deletedOrder = await Order.findByIdAndDelete(slug);

    if (!deletedOrder) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
