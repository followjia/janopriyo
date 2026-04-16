import { NextRequest, NextResponse } from 'next/server';

import connectToDatabase from '@/lib/db';
import GlobalSettings from '@/models/GlobalSettings';

// Use Node.js runtime because Mongoose/MongoDB are not supported on Edge
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const settings = await GlobalSettings.findOne({}).sort({ updatedAt: -1 }).lean() as any;
        
        // Prioritize ENV variables for immediate functionality
        const pixelId = settings?.metaPixelId || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;
        const accessToken = process.env.FACEBOOK_ACCESS_TOKEN || settings?.facebookAccessToken;
        
        if (!pixelId || !accessToken) {
            console.error('[FB CAPI] Missing configuration:', { hasPixel: !!pixelId, hasToken: !!accessToken });
            return NextResponse.json({ error: 'Missing Facebook config' }, { status: 500 });
        }

        const body = await request.json();
        const { eventName = 'PageView', eventUrl, userAgent, testEventCode } = body;
        
        // Use test code from request, then from setting, then from env as final fallback
        const activeTestCode = testEventCode || settings?.facebookTestEventCode || process.env.FACEBOOK_TEST_EVENT_CODE;

        // Get real client IP
        const ipAddress =
            request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
            request.headers.get('x-real-ip') ||
            '0.0.0.0';

        // Generate unique event ID for deduplication with browser pixel
        const eventId = body.eventId || crypto.randomUUID();

        const payload: any = {
            data: [
                {
                    event_name: eventName,
                    event_time: Math.floor(Date.now() / 1000),
                    event_id: eventId,
                    event_source_url: eventUrl,
                    action_source: 'website',
                    user_data: {
                        client_ip_address: ipAddress,
                        client_user_agent: userAgent,
                    },
                },
            ],
        };

        if (activeTestCode) {
            payload.test_event_code = activeTestCode;
        }

        const fbResponse = await fetch(
            `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }
        );

        const result = await fbResponse.json();

        if (!fbResponse.ok) {
            console.error('[FB CAPI] Error:', {
                status: fbResponse.status,
                result,
                payload,
                pixelId: pixelId,
                token: accessToken ? `${accessToken.substring(0, 6)}...` : 'not set'
            });
            return NextResponse.json(
                { error: 'Failed to send event to Facebook' },
                { status: fbResponse.status }
            );
        }

        return NextResponse.json({ success: true, eventId });
    } catch (error) {
        console.error('[FB CAPI] Unexpected error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
