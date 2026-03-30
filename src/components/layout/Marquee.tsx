'use client';

import { useEffect, useState } from 'react';

export function Marquee() {
  const [marqueeText, setMarqueeText] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings', { signal: controller.signal });
        if (!res.ok) throw new Error('Failed to fetch settings');
        
        const data = await res.json();
        setMarqueeText(data.marqueeText || 'Welcome to Janopriyo Shop! Free shipping on orders over $500.');
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching marquee text:', error);
          setMarqueeText('Welcome to Janopriyo Shop!');
        }
      }
    }
    fetchSettings();

    return () => controller.abort();
  }, []);

  if (!marqueeText) return null;

  return (
    <div className="bg-primary text-primary-foreground py-2 overflow-hidden whitespace-nowrap">
      <div className="inline-block animate-marquee motion-reduce:animate-none px-4">
        <span className="mx-4 font-medium uppercase tracking-wider text-xs sm:text-sm">
          {marqueeText}
        </span>
        <span className="mx-4 font-medium uppercase tracking-wider text-xs sm:text-sm border-l pl-8">
          {marqueeText}
        </span>
        <span className="mx-4 font-medium uppercase tracking-wider text-xs sm:text-sm border-l pl-8">
          {marqueeText}
        </span>
        <span className="mx-4 font-medium uppercase tracking-wider text-xs sm:text-sm border-l pl-8">
          {marqueeText}
        </span>
      </div>
    </div>
  );
}
