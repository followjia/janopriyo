import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import FAQ from '@/models/FAQ';

export async function GET() {
  try {
    const session = await auth();
    
    // Security check: Only admins can trigger seeding
    if (!session || !(['admin', 'super_admin'].includes((session.user as any)?.role))) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
    }

    await connectToDatabase();

    // Check if FAQs already exist to avoid accidental duplicates
    const existingCount = await FAQ.countDocuments();
    if (existingCount > 0) {
      return NextResponse.json({ 
        message: 'FAQs are already present in the database. Seeding skipped to avoid duplicates.',
        count: existingCount 
      });
    }

    const initialFaqs = [
      {
        question: "Do you deliver all over Bangladesh?",
        answer: "Yes, we provide nationwide home delivery through professional courier services like Steadfast, Pathao, and RedX. Delivery usually takes 2-3 days in Dhaka and 3-5 days outside Dhaka.",
        order: 1
      },
      {
        question: "How can I track my order?",
        answer: "Once your order is shipped, you will receive a tracking link in your customer dashboard and via SMS. You can use this link to check the live status of your parcel.",
        order: 2
      },
      {
        question: "What are your payment methods?",
        answer: "We accept Cash on Delivery (COD) as well as secure online payments including bKash, Nagad, Rocket, and all major Credit/Debit cards through SSLCommerz.",
        order: 3
      },
      {
        question: "What is your return policy?",
        answer: "We offer a 7-day easy return policy if the product is damaged, defective, or not as described. Please keep the original packaging and contact our support immediately.",
        order: 4
      },
      {
        question: "Are the products genuine?",
        answer: "Absolutely. We source all our products directly from authorized distributors and manufacturers to ensure 100% authenticity for our customers.",
        order: 5
      }
    ];

    const result = await FAQ.insertMany(initialFaqs);

    return NextResponse.json({ 
      message: 'FAQs seeded successfully!', 
      count: result.length,
      data: result 
    });

  } catch (error: any) {
    console.error('FAQ Seeding Error:', error);
    return NextResponse.json({ 
      error: 'Seeding failed', 
      details: error.message || 'Unknown error' 
    }, { status: 500 });
  }
}
