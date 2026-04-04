import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return NextResponse.redirect(`${baseUrl}/checkout`, 303);
}
