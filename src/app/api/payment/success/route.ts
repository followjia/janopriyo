import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import Order from '@/models/Order';
import { validatePayment } from '@/lib/sslcommerz';

/**
 * Payment Success Callback Handler
 * This route is called by SSLCommerz after a successful payment transaction.
 */
export async function POST(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const orderId = searchParams.get('id');
    const body = await req.formData();
    const data = Object.fromEntries(body.entries());

    if (!orderId) {
      return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
    }

    // Verify Payment with SSLCommerz using native fetch
    const response = await validatePayment(data);

    if (response?.status === 'VALID' || response?.status === 'VALIDATED') {
      await connectToDatabase();
      const order = await Order.findById(orderId);

      if (order) {
        order.paymentStatus = 'Paid';
        order.status = 'Confirmed';
        order.transactionId = data.tran_id?.toString();
        await order.save();
      }

      // Redirect to success page
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      return NextResponse.redirect(`${baseUrl}/checkout/success?id=${orderId}`, 303);
    } else {
      console.error('SSLCommerz Validation Failed:', response);
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      return NextResponse.redirect(`${baseUrl}/checkout/fail?id=${orderId}&reason=ValidationFailed`, 303);
    }
  } catch (error) {
    console.error('Payment Success Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
