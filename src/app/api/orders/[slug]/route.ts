/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import User from '@/models/User';
import GlobalSettings from '@/models/GlobalSettings';
import WalletTransaction from '@/models/WalletTransaction';
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

    const allowedStatuses = ['Order Placed', 'Confirmed', 'Paid', 'Ready for Delivery', 'Released for Delivery', 'Cancelled', 'Delivered'];
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

    // ----------------------------
    // Loyalty System: Award Tokens on Success
    // ----------------------------
    const isOrderSuccessful = status === 'Delivered';
    
    if (isOrderSuccessful && !order.isRewarded && order.user) {
        let session: mongoose.ClientSession | null = null;
        try {
            const conn = await connectToDatabase();
            session = await conn.startSession();
            if (!session) throw new Error('Failed to start session');
            session.startTransaction();

            const user = await User.findById(order.user).session(session);
            const settings = await GlobalSettings.findOne({}).session(session);
            const subConfig = settings?.subscriptionConfig || { activationThreshold: 5000, rewardPercentage: 5 };

            if (user) {
                // 1. Check for Subscription Activation (if not already active)
                if (!user.isSubscriptionActive) {
                    if (order.totalAmount >= subConfig.activationThreshold) {
                        await User.findByIdAndUpdate(user._id, { isSubscriptionActive: true }, { session });
                    }
                } 
                
                // 2. Award Tokens
                const rewardAmount = order.earnedRewardAmount || 0;
                if ((user.isSubscriptionActive || order.totalAmount >= subConfig.activationThreshold) && rewardAmount > 0) {
                    // Atomic increment
                    await User.findByIdAndUpdate(user._id, { 
                        $inc: { walletBalance: rewardAmount } 
                    }, { session });
                    
                    // Log Wallet Transaction (Earned)
                    await WalletTransaction.create([{
                        userId: user._id,
                        amount: rewardAmount,
                        type: 'earned',
                        status: 'completed',
                        orderId: order._id,
                        description: `Tokens earned from order #${order._id.toString().slice(-6).toUpperCase()}`
                    }], { session });
                }

                // 3. Mark order as rewarded
                await Order.findByIdAndUpdate(order._id, { isRewarded: true }, { session });
                if (session) await session.commitTransaction();
                
                // Refresh local order object for response
                order.isRewarded = true;
            }
        } catch (error) {
            if (session) await session.abortTransaction();
            console.error('Failed to award loyalty rewards atomically:', error);
            // We don't throw here to avoid failing the whole order update, 
            // but the transaction ensures consistency for the reward part.
        } finally {
            if (session) await session.endSession();
        }
    }
    // ----------------------------

    // Ensure required fields exist for old data
    if (order.deliveryCharge === undefined || order.deliveryCharge === null) {
        order.deliveryCharge = 0;
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
