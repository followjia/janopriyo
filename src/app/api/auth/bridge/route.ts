import { NextRequest, NextResponse } from 'next/server';
import { decode } from 'next-auth/jwt';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login?error=MissingToken', req.url));
  }

  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error('Bridge: Missing AUTH_SECRET/NEXTAUTH_SECRET');
    return NextResponse.redirect(new URL('/login?error=ConfigurationError', req.url));
  }

  const isProd = process.env.NODE_ENV === 'production';
  const cookieName = isProd ? '__Secure-authjs.session-token' : 'authjs.session-token';

  try {
    console.log('Bridge: Decoding token...');
    const decoded = await decode({
      token,
      secret,
      salt: 'authjs.session-token',
    });

    if (!decoded) {
      console.error('Bridge: Token decoding failed (possibly wrong secret or salt)');
      return NextResponse.redirect(new URL('/login?error=TokenInvalid', req.url));
    }

    const now = Math.floor(Date.now() / 1000);
    const isExpired = typeof decoded.exp !== 'number' || decoded.exp < now;

    if (isExpired) {
       console.error('Bridge: Token expired');
       return NextResponse.redirect(new URL('/login?error=TokenExpired', req.url));
    }

    // Connect to DB to sync user for this tenant
    const { headers } = await import('next/headers');
    const headersList = await headers();
    const domain = headersList.get('host') || 'unknown';

    console.log(`Bridge: Syncing user for domain: ${domain}`);
    
    try {
      const connectToDatabase = (await import('@/lib/db')).default;
      const User = (await import('@/models/User')).default;

      await connectToDatabase();

      if (decoded.email) {
        await User.findOneAndUpdate(
          { email: decoded.email, domain },
          {
            $set: {
              name: decoded.name || 'Unknown',
              image: (decoded as any).picture || (decoded as any).image || '',
              role: (decoded as any).role || 'user',
            },
            $setOnInsert: {
              email: decoded.email,
              domain,
            }
          },
          { upsert: true, new: true }
        );
        console.log('Bridge: User synced successfully');
      }
    } catch (dbError) {
      console.error('Bridge: Database/User sync error:', dbError instanceof Error ? dbError.message : dbError);
      // We continue even if DB sync fails, so the user can still get a session
    }

    const cookieStore = await cookies();
    
    console.log('Bridge: Setting session cookie');
    cookieStore.set(cookieName, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, 
    });

    const response = NextResponse.redirect(new URL('/dashboard', req.url));
    response.headers.set('Referrer-Policy', 'no-referrer');
    return response;
  } catch (error) {
    console.error('Bridge Fatal Error:', error instanceof Error ? error.message : 'Auth bridge failed');
    return NextResponse.redirect(new URL('/login?error=BridgeFailed', req.url));
  }
}
