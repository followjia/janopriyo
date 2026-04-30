'use client';

import { useState, useEffect, useMemo } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, FreeMode } from 'swiper/modules';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
            <h2 className="text-3xl font-black tracking-tighter sm:text-4xl">
              {title}
            </h2>
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
              speed={3000}

              autoplay={{
                delay: 1,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}

              // ✅ FIXED VERSION
              freeMode={{
                enabled: true,
                momentum: false
              }}

              spaceBetween={20}
              slidesPerView={1.2}
              grabCursor={true}

              loopAdditionalSlides={safeProducts.length}

              breakpoints={{
                480: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 }
              }}

              className="pb-4 smooth-swiper"
            >
              {safeProducts.map((product, index) => (
                <SwiperSlide key={product._id + index}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>

      </div>

      {/* ✅ Ultra smooth linear animation */}
      <style jsx global>{`
        .smooth-swiper .swiper-wrapper {
          transition-timing-function: linear !important;
        }
      `}</style>
    </section>
  );
}