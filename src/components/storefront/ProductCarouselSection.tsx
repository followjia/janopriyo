'use client';

import { useState, useEffect, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/storefront/ProductCard';
import Link from 'next/link';

// ✅ Swiper styles
import 'swiper/css';
import 'swiper/css/autoplay';
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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ IMPORTANT: duplicate products if low count (fix loop jump)
  const safeProducts = useMemo(() => {
    if (!products) return [];
    if (products.length < 6) {
      return [...products, ...products, ...products];
    }
    return products;
  }, [products]);

  if (!products || products.length === 0) return null;

  return (
    <section className={`py-12 ${bgColor} overflow-hidden`}>
      <div className="container mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black tracking-tighter sm:text-4xl">
                {title}
              </h2>
              {isFlashSale && (
                <Badge variant="destructive" className="bg-red-600 animate-pulse border-none rounded-full flex items-center gap-1.5 px-3">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  LIVE
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-muted-foreground max-w-[600px]">
                {description}
              </p>
            )}
          </div>

          <Button
            variant="outline"
            className="rounded-full font-bold group"
            render={<Link href={viewAllLink} />}
            nativeButton={false}
          >
            View All
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        {/* Swiper */}
        <div className={`relative transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          {mounted && (
            <Swiper
              modules={[Autoplay, FreeMode]}

              loop={true}
              speed={800}

              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}

              freeMode={{
                enabled: true,
                momentum: true,
                sticky: false
              }}

              spaceBetween={20}
              slidesPerView={1.2}
              slidesPerGroup={1}
              grabCursor={true}

              loopAdditionalSlides={safeProducts.length}

              breakpoints={{
                480: { slidesPerView: 2, slidesPerGroup: 1 },
                768: { slidesPerView: 3, slidesPerGroup: 1 },
                1024: { slidesPerView: 4, slidesPerGroup: 1 }
              }}

              className="pb-4"
            >
              {safeProducts.map((product, index) => (
                <SwiperSlide key={product._id + index}>
                  <ProductCard product={product} isFlashSale={isFlashSale} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

      </div>
    </section>
  );
}