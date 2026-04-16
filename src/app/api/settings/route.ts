import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import connectToDatabase from '@/lib/db';
import GlobalSettings from '@/models/GlobalSettings';
import { auth } from '@/auth';

// GET global settings
export async function GET() {
  try {
    await connectToDatabase();
    const settings = await GlobalSettings.findOne({}).sort({ updatedAt: -1 });
    if (!settings) {
      return NextResponse.json({
        brandName: process.env.NEXT_PUBLIC_STORE_NAME || "Janopriyo Shop",
        logo: "/logo.png",
        contact: {
          email: "support@janopriyo.shop",
          phone: "+8801234567890",
          address: "Dhaka, Bangladesh"
        },
        marqueeText: "Welcome to Janopriyo Shop!",
        socialLinks: {}
      });
    }

    const rawSettings = settings.toObject({ getters: false });
    const maskedSettings = settings.toObject({ getters: true });

    const safeResult = {
      ...maskedSettings,
      facebookAccessToken: rawSettings.facebookAccessToken ? "********************" : null,
      courierConfig: maskedSettings.courierConfig ? {
        ...maskedSettings.courierConfig,
        steadfast: rawSettings.courierConfig?.steadfast?.apiKey ? { apiKey: "********************", secretKey: "********************" } : maskedSettings.courierConfig.steadfast,
        pathao: rawSettings.courierConfig?.pathao?.clientId ? { clientId: "********************", clientSecret: "********************", storeId: "********************" } : maskedSettings.courierConfig.pathao,
        redx: rawSettings.courierConfig?.redx?.apiKey ? { apiKey: "********************" } : maskedSettings.courierConfig.redx,
      } : maskedSettings.courierConfig
    };

    return NextResponse.json(safeResult);
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
      await settings.save({ validateBeforeSave: false });
    } else {
      // Create new settings record
      settings = await GlobalSettings.create(allowedBody);
    }

    revalidateTag('settings', 'max');
    
    // Mask sensitive response data for the return
    const safeResult = {
      ...(settings as any).toObject ? (settings as any).toObject() : settings,
      facebookAccessToken: (settings as any).facebookAccessToken ? "********************" : null
    };

    return NextResponse.json(safeResult, { status: 200 });
  } catch (error: any) {
    console.error('CRITICAL: Error updating settings:', error);
    if (error.name === 'ValidationError') {
      const fieldErrors = Object.keys(error.errors || {}).join(', ');
      return NextResponse.json({ 
        message: `Validation Error: Missing or invalid fields (${fieldErrors}). Please ensure General Settings are filled.`,
        details: error.errors 
      }, { status: 400 });
    }
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
