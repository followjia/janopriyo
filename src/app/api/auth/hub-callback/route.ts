import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { encode } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const target = searchParams.get('target');

  if (!session || !session.user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (!target) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Validate target domain to prevent Open Redirect attacks
  const hubDomain = process.env.NEXT_PUBLIC_HUB_DOMAIN || 'localhost:3000';
  const allowedHosts = [hubDomain, 'localhost'];
  const isAllowed = allowedHosts.some(h => h && (target === h || target.endsWith(`.${h}`))) || 
                   target.includes('localhost');

  if (!isAllowed) {
    return NextResponse.redirect(new URL('/login?error=InvalidTarget', req.url));
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error('NEXTAUTH_SECRET is not defined');
    return NextResponse.redirect(new URL('/login?error=ConfigurationError', req.url));
  }

  const token = await encode({
    token: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      role: (session.user as any).role,
      exp: Math.floor(Date.now() / 1000) + 60, // 1 minute expiration
    },
    secret,
    salt: 'authjs.session-token', // Default salt for Auth.js
  });

  // Redirect back to tenant bridge
  const protocol = req.nextUrl.protocol;
  const bridgeUrl = `${protocol}//${target}/api/auth/bridge?token=${token}`;

  const response = NextResponse.redirect(bridgeUrl);
  
  // Security: Prevent token leakage in referrers
  response.headers.set('Referrer-Policy', 'no-referrer');
  
  return response;
}
