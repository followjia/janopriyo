import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { encode } from 'next-auth/jwt';

export async function GET(req: NextRequest) {
  const session = await auth();
  const url = new URL(req.url);
  const target = url.searchParams.get('target');

  console.log(`Hub Callback triggered. Target: ${target}, Session: ${!!session}`);

  if (!session || !session.user) {
    // If no session, go back to login with the target preserved
    const loginUrl = target ? `/login?remote_tenant=${encodeURIComponent(target)}` : '/login';
    return NextResponse.redirect(new URL(loginUrl, req.url));
  }

  if (!target) {
    console.warn('Hub Callback: No target found, redirecting to hub dashboard');
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Validate target to prevent Open Redirect attacks
  // Must be a valid hostname (no protocol, no path traversal)
  const hasProtocol = target.includes('://');
  const hasDotOrIsLocal = target.includes('.') || target.includes('localhost');
  const isAllowed = !hasProtocol && hasDotOrIsLocal;

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
    salt: 'authjs.session-token',
  });

  // Redirect back to tenant bridge
  const protocol = req.nextUrl.protocol;
  const bridgeUrl = `${protocol}//${target}/api/auth/bridge?token=${token}`;

  const response = NextResponse.redirect(bridgeUrl);
  
  // Security: Prevent token leakage in referrers
  response.headers.set('Referrer-Policy', 'no-referrer');
  
  return response;
}
