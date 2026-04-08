/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order, { IOrderItem } from '@/models/Order';
import Product from '@/models/Product';
import { auth } from '@/auth';

import { z } from 'zod';
import mongoose from 'mongoose';
import crypto from 'crypto';

class StockError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StockError';
  }
}


const orderItemSchema = z.object({
  product: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  name: z.string().min(1, 'Product name is required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  price: z.number().positive(), // We will re-validate this on the server
  image: z.string().url().optional().or(z.literal('')),
});

const orderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
  shippingAddress: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    phone: z.string().min(10, 'Invalid phone number'),
    street: z.string().min(1, 'Street is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(4, 'Invalid zip code'),
    country: z.string().min(1, 'Country is required'),
  }),
  paymentMethod: z.preprocess((val) => {
    if (typeof val === 'string') {
      const normalized = val.trim().toLowerCase();
      if (normalized === 'cash on delivery' || normalized === 'cod') {
        return 'COD';
      }
    }
    return val;
  }, z.enum(['COD', 'Online'])),
  deliveryCharge: z.number().min(0).optional(),
});

export async function POST(req: NextRequest) {
  let session: mongoose.ClientSession | null = null;
  
  try {
    const sessionUser = await auth();
    const body = await req.json();

    // 1. Validate Input Schema
    const validation = orderSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        message: 'Validation failed', 
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { items, shippingAddress, paymentMethod } = validation.data;
    const clientProvidedDeliveryCharge = validation.data.deliveryCharge;

    const conn = await connectToDatabase();
    session = await conn.startSession();
    if (!session) {
        throw new Error('Failed to start database session');
    }
    session.startTransaction();

    let serverComputedTotal = 0;
    const validatedItems: IOrderItem[] = [];

    // 2. Atomic Stock Validation and Price Verification
    for (const item of items) {
      // Use findOneAndUpdate with stock check for atomicity
      // We both verify the product exists AND has enough stock in ONE operation
      const product = await Product.findOneAndUpdate(
        { 
          _id: item.product, 
          stock: { $gte: item.quantity },
          isPublished: true 
        },
        { $inc: { stock: -item.quantity } },
        { session, new: true }
      );

      if (!product) {
        throw new StockError(`Insufficient stock or product not found: ${item.name}`);
      }

      // 3. Re-calculate price using server source of truth
      const itemPrice = product.salePrice ?? product.price;
      const lineTotal = itemPrice * item.quantity;
      serverComputedTotal += lineTotal;

      validatedItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: itemPrice,
        image: product.images?.[0] || '',
      });
    }

    // 4. Calculate Delivery Charge
    const isDhaka = 
      shippingAddress.city.toLowerCase().includes('dhaka') || 
      shippingAddress.state.toLowerCase().includes('dhaka');
    const serverComputedDeliveryCharge = isDhaka ? 60 : 120;

    // 5. Verify Delivery Charge (if provided by client)
    if (clientProvidedDeliveryCharge !== undefined && clientProvidedDeliveryCharge !== serverComputedDeliveryCharge) {
      if (session) await session.abortTransaction();
      return NextResponse.json({ 
        message: 'Delivery charge mismatch. Please refresh your cart.',
        serverCharge: serverComputedDeliveryCharge
      }, { status: 400 });
    }

    // 6. Create the order within the transaction
    const [newOrder] = (await Order.create(
      [
        {
          user: (sessionUser?.user?.id as any) || undefined, // Allow guest checkout
          items: validatedItems,
          deliveryCharge: serverComputedDeliveryCharge,
          totalAmount: serverComputedTotal + serverComputedDeliveryCharge,
          shippingAddress,
          paymentMethod,
          paymentStatus: 'Pending',
          status: 'Order Placed',
          transactionId: paymentMethod === 'Online' ? `ORDER-${crypto.randomUUID().replace(/-/g, '').toUpperCase().slice(0, 16)}` : undefined,
        },
      ],
      { session }
    )) as any;

    await session.commitTransaction();
    return NextResponse.json(newOrder, { status: 201 });

  } catch (error: any) {
    if (session) {
      await session.abortTransaction();
    }
    console.error('Error creating order (Hardened):', error);
    const isClientError = error instanceof StockError;
    return NextResponse.json({ 
        message: isClientError ? error.message : 'Internal Server Error' 
    }, { status: isClientError ? 400 : 500 });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}

// GET orders
// If current user is Admin and ?all=true, returns ALL orders
// Otherwise returns only orders for the current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fetchAll = searchParams.get('all') === 'true';
    const isAdmin = (session.user as any)?.role === 'admin';

    await connectToDatabase();

    let query = {};
    if (fetchAll && isAdmin) {
      // Admins can see all orders
      query = {};
    } else {
      // Normal users (or admins without ?all=true) see their own orders
      const userId = (session.user as any).id;
      if (!userId) {
        return NextResponse.json({ message: 'User ID missing from session' }, { status: 400 });
      }
      query = { user: userId };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name email'); // Populate user info for admin view

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
