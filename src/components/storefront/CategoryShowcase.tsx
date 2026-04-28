'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface CategoryShowcaseProps {
  categories: Category[];
}

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="bg-muted/30 py-16 overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center text-center space-y-4 mb-10">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
            Browse by Category
          </h2>
          <p className="max-w-[700px] text-muted-foreground md:text-lg">
            Find exactly what you&apos;re looking for by exploring our curated collections.
          </p>
        </div>

        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={16}
          slidesPerView={2}
          grabCursor={true}
          pagination={{
            clickable: true,
            dynamicBullets: true,
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          breakpoints={{
            480: { slidesPerView: 3, spaceBetween: 16 },
            768: { slidesPerView: 4, spaceBetween: 20 },
            1024: { slidesPerView: 6, spaceBetween: 24 },
            1280: { slidesPerView: 7, spaceBetween: 24 },
          }}
          className="pb-14 !static"
          style={{
            "--swiper-pagination-bottom": "0px",
            "--swiper-theme-color": "hsl(var(--primary))"
          } as React.CSSProperties}
        >
          {categories.map((category) => (
            <SwiperSlide key={category._id} className="h-auto">
              <Link
                href={`/shop?category=${encodeURIComponent(category.slug)}`}
                className="group block"
              >
                <div className="flex flex-col items-center gap-3 py-2 transition-all hover:-translate-y-1">
                  <div className="h-16 w-16 overflow-hidden rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors text-center line-clamp-2">
                    {category.name}
                  </h3>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
