'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, FreeMode } from 'swiper/modules';
import { ArrowRight, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/storefront/ProductCard';
import Link from 'next/link';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/free-mode';

interface ProductCarouselSectionProps {
  title: string;
  description?: string;
  products: any[];
  viewAllLink: string;
  isFlashSale?: boolean;
  saleEndTimestamp?: number | string;
  bgColor?: string;
}

export function ProductCarouselSection({
  title,
  description,
  products,
  viewAllLink,
  isFlashSale = false,
  saleEndTimestamp,
  bgColor = "bg-background"
}: ProductCarouselSectionProps) {
  const calculateTimeLeft = () => {
    let target: number;
    if (saleEndTimestamp) {
      target = typeof saleEndTimestamp === 'string' ? new Date(saleEndTimestamp).getTime() : saleEndTimestamp;
    } else {
      target = new Date().setHours(23, 59, 59, 999);
    }
    const difference = target - Date.now();
    if (difference <= 0) return { hours: 0, minutes: 0, seconds: 0 };
    return {
      hours: Math.floor((difference / (1000 * 60 * 60))),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  };

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isFlashSale) return;
    
    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFlashSale, saleEndTimestamp]);

  if (!products || products.length === 0) return null;

  // Create unique class names for navigation to avoid conflicts if multiple carousels are on the page
  const prevId = `swiper-prev-${title.replace(/[^a-zA-Z0-9]/g, '')}`;
  const nextId = `swiper-next-${title.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <section className={`py-16 ${bgColor} overflow-hidden`}>
      <div className="container px-4 md:px-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6">
          <div className="flex items-start gap-4">
            {isFlashSale && (
              <div className="bg-primary text-primary-foreground p-3 rounded-2xl animate-pulse mt-1 shrink-0">
                <Zap className="h-6 w-6 fill-current" />
              </div>
            )}
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter sm:text-4xl">{title}</h2>
              {description && !isFlashSale && (
                <p className="text-muted-foreground md:text-lg max-w-[600px]">{description}</p>
              )}
              {isFlashSale && mounted && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Ending In:</span>
                  <div className="flex gap-1 text-primary font-mono font-bold font-black tabular-nums" suppressHydrationWarning>
                    <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
                    <span>:</span>
                    <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
                    <span>:</span>
                    <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            {/* Custom Navigation Arrows */}
            <div className="hidden md:flex items-center gap-2">
              <button className={`${prevId} h-10 w-10 flex items-center justify-center rounded-full border border-border bg-background hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:hover:bg-background disabled:hover:text-foreground cursor-pointer z-10`}>
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button className={`${nextId} h-10 w-10 flex items-center justify-center rounded-full border border-border bg-background hover:bg-primary hover:text-primary-foreground transition-colors disabled:opacity-50 disabled:hover:bg-background disabled:hover:text-foreground cursor-pointer z-10`}>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <Button 
              variant="outline" 
              className="rounded-full font-bold group"
              render={<Link href={viewAllLink} />}
              nativeButton={false}
            >
              View All <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>

        {/* Swiper Carousel */}
        <div className="relative -mx-4 px-4 md:mx-0 md:px-0">
          <Swiper
            modules={[Navigation, Autoplay, FreeMode]}
            spaceBetween={16}
            slidesPerView={1.2} // Show a peek of the next slide on mobile
            freeMode={true}
            grabCursor={true}
            navigation={{
              prevEl: `.${prevId}`,
              nextEl: `.${nextId}`,
            }}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            }}
            breakpoints={{
              480: {
                slidesPerView: 2,
                spaceBetween: 16,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 24,
                freeMode: false // Snap on desktop
              }
            }}
            className="pb-4"
          >
            {products.map((product) => (
              <SwiperSlide key={product._id} className="h-auto">
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
