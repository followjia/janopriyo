import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { auth } from '@/auth';

const ALLOWED_ORDER_STATUSES = ['Order Placed', 'Confirmed', 'Paid', 'Ready for Delivery', 'Released for Delivery', 'Cancelled', 'Delivered'];
const ALLOWED_PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed'];
const MAX_BULK_IDS = 100;

function validateIds(ids: any) {
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return 'No order IDs provided';
  }
  if (ids.length > MAX_BULK_IDS) {
    return `Cannot process more than ${MAX_BULK_IDS} orders at once`;
  }
  for (const id of ids) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return `Invalid order ID format: ${id}`;
    }
  }
  return null;
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !(['admin', 'super_admin'].includes((session?.user as any)?.role))) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { ids, status, paymentStatus } = await req.json();

    const idError = validateIds(ids);
    if (idError) {
      return NextResponse.json({ message: idError }, { status: 400 });
    }

    const updateData: any = {};
    
    if (status) {
      if (!ALLOWED_ORDER_STATUSES.includes(status)) {
        return NextResponse.json({ 
          message: `Invalid status. Allowed values: ${ALLOWED_ORDER_STATUSES.join(', ')}` 
        }, { status: 400 });
      }
      updateData.status = status;
    }

    if (paymentStatus) {
      if (!ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)) {
        return NextResponse.json({ 
          message: `Invalid payment status. Allowed values: ${ALLOWED_PAYMENT_STATUSES.join(', ')}` 
        }, { status: 400 });
      }
      updateData.paymentStatus = paymentStatus;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No valid update data provided' }, { status: 400 });
    }

    await connectToDatabase();

    const result = await Order.updateMany(
      { _id: { $in: ids } },
      { $set: updateData }
    );

    return NextResponse.json({ 
      message: `${result.modifiedCount} orders updated successfully`,
      count: result.modifiedCount 
    });
  } catch (error) {
    console.error('Bulk Update Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
    try {
      const session = await auth();
      if (!session || !(['admin', 'super_admin'].includes((session?.user as any)?.role))) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
  
      const { ids } = await req.json();
  
      const idError = validateIds(ids);
      if (idError) {
        return NextResponse.json({ message: idError }, { status: 400 });
      }
  
      await connectToDatabase();
  
      const result = await Order.updateMany(
        { _id: { $in: ids } },
        { $set: { deletedAt: new Date() } }
      );
  
      return NextResponse.json({ 
        message: `${result.modifiedCount} orders soft-deleted successfully`,
        count: result.modifiedCount 
      });
    } catch (error) {
      console.error('Bulk Delete Error:', error);
      return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
  }
