import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import connectToDatabase from '@/lib/db';
import GlobalSettings from '@/models/GlobalSettings';
import { auth } from '@/auth';

// GET global settings
export async function GET() {
  try {
    await connectToDatabase();
    const settings = await GlobalSettings.findOne({});
    if (!settings) {
      // Return default settings if none exist yet to prevent UI failures
      return NextResponse.json({
        brandName: process.env.NEXT_PUBLIC_STORE_NAME || "Janopriyo Shop",
        logo: "/logo.png",
        contact: {
          email: "support@janopriyo.shop",
          phone: "+8801234567890",
          address: "Dhaka, Bangladesh"
        },
        marqueeText: "Welcome to Janopriyo Shop! Free shipping on orders over $500.",
        socialLinks: {}
      });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create or update global settings (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ message: 'Invalid JSON request body' }, { status: 400 });
    }

    // Whitelist allowed fields to prevent mass-assignment
    const allowedFields = [
      'brandName', 'logo', 'favicon', 'contact', 'socialLinks',
      'marqueeText', 'metaTitle', 'metaDescription',
      'googleTagManagerId', 'searchConsoleMeta', 'facebookDomainVerification', 'metaPixelId',
      'facebookAccessToken', 'facebookTestEventCode',
      'courierConfig'
    ];
    const allowedBody: any = {};

    Object.keys(body).forEach((key) => {
      if (allowedFields.includes(key)) {
        allowedBody[key] = body[key];
      }
    });

    if (Object.keys(allowedBody).length === 0) {
      return NextResponse.json({ message: 'No valid fields provided for update' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if settings already exist
    let settings = await GlobalSettings.findOne({});
    if (settings) {
      // Update existing settings document manually to trigger setters/encryption
      Object.keys(allowedBody).forEach((key) => {
        (settings as any)[key] = allowedBody[key];
      });
      await settings.save();
    } else {
      // Create new settings record
      settings = await GlobalSettings.create(allowedBody);
    }

    revalidateTag('settings', 'default');

    // Mask sensitive response data for the return
    const safeResult = {
      ...(settings as any).toObject ? (settings as any).toObject() : settings,
      facebookAccessToken: (settings as any).facebookAccessToken ? "********************" : null
    };

    return NextResponse.json(safeResult, { status: 200 });
  } catch (error: any) {
    console.error('CRITICAL: Error updating settings:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({
        message: 'Validation Error: Missing required branding or contact fields. Please fill out General Settings first.',
        details: error.errors
      }, { status: 400 });
    }
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
