'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/storefront/ProductCard';
import Link from 'next/link';

// Import Swiper styles
import 'swiper/css';

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

  if (!products || products.length === 0) return null;

  return (
    <section className={`py-12 ${bgColor} overflow-hidden`}>
      <div className="container mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-6">
          <div className="flex items-start gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tighter sm:text-4xl">{title}</h2>
              {description && <p className="text-muted-foreground max-w-[600px]">{description}</p>}
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
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

        {/* Swiper Carousel with Smooth Transition */}
        <div className={`relative -mx-4 px-4 md:mx-0 md:px-0 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
          {mounted && (
            <Swiper
              modules={[Autoplay]}
              spaceBetween={16}
              slidesPerView={1.2}
              grabCursor={true}
              speed={800}
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
          )}
          
          {/* Invisible placeholder to maintain layout during mount */}
          {!mounted && (
             <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="min-w-[280px] h-[400px] bg-muted/10 animate-pulse rounded-2xl" />
                ))}
             </div>
          )}
        </div>
      </div>
    </section>
  );
}
