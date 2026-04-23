'use client';

import { Ticket, Plus, Wallet, ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ComboOfferBannerProps {
  activeCoupon: any;
  settings: any;
}

export function ComboOfferBanner({ activeCoupon, settings }: ComboOfferBannerProps) {
  // If there's an active coupon, show the special announcement
  if (activeCoupon) {
    const discountText = activeCoupon.discountType === 'percentage' 
      ? `${activeCoupon.discountValue}%` 
      : `৳${activeCoupon.discountValue}`;
    
    const rawExpiryDate = new Date(activeCoupon.expiryDate);
    const isValidDate = !isNaN(rawExpiryDate.getTime());
    
    const expiryDateString = isValidDate 
      ? rawExpiryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
      : '';

    return (
      <section className="py-12 bg-primary text-black relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 rounded-full bg-black/10 flex items-center justify-center animate-bounce">
                <Ticket className="h-10 w-10 text-black" />
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic">
                  Special Offer!
                </h2>
                <p className="text-lg font-bold leading-tight">
                  Get <span className="underline decoration-black decoration-4">{discountText} OFF</span> using code 
                  <span className="mx-2 px-3 py-1 bg-black text-white rounded-lg font-mono text-2xl">{activeCoupon.code}</span>
                  {expiryDateString && `until ${expiryDateString}!`}
                </p>
                <p className="text-xs font-black opacity-60 uppercase tracking-widest">
                  *Stackable with your loyalty tokens for extra savings
                </p>
              </div>
            </div>
            
            <Button asChild size="lg" className="rounded-full px-10 h-14 bg-black hover:bg-black/80 text-white font-black group shadow-xl">
              <Link href="/shop" className="flex items-center gap-2">
                CLAIM DISCOUNT NOW
                <ShoppingCart className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-full bg-white/10 -skew-x-12 translate-x-16" />
        <div className="absolute top-0 right-0 w-16 h-full bg-white/5 -skew-x-12 translate-x-8" />
      </section>
    );
  }

  // Fallback to Loyalty Promo if no coupon
  const threshold = settings?.subscriptionConfig?.activationThreshold || 5000;
  const percentage = settings?.subscriptionConfig?.rewardPercentage || 5;

  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-primary/5 border-y border-primary/10 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
              DOUBLE YOUR <span className="text-primary italic">SAVINGS!</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Combine your loyalty benefits with seasonal offers. Spend <span className="text-foreground font-bold">৳{threshold}</span> to unlock <span className="text-primary font-bold">{percentage}% lifetime rewards!</span>
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-4xl">
            <div className="flex-1 bg-background border rounded-3xl p-8 shadow-sm group">
              <Ticket className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Apply Coupons</h3>
              <p className="text-sm text-muted-foreground">Use any active promo code during checkout for instant cuts.</p>
            </div>
            <div className="flex items-center justify-center bg-primary text-black h-12 w-12 rounded-full font-black text-2xl shadow-lg">
              <Plus />
            </div>
            <div className="flex-1 bg-background border rounded-3xl p-8 shadow-sm group">
              <Wallet className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold mb-2">Use Tokens</h3>
              <p className="text-sm text-muted-foreground">Check the "Use Token Balance" box to pay even less.</p>
            </div>
          </div>

          <div className="pt-6">
            <Button asChild size="lg" className="rounded-full px-12 h-14 bg-black hover:bg-black/90 text-white font-bold group">
              <Link href="/shop">
                START SAVING NOW
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

