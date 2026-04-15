'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

interface Banner {
  _id?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  link?: string;
  primaryBtnText?: string;
  primaryBtnLink?: string;
  secondaryBtnText?: string;
  secondaryBtnLink?: string;
}

interface HeroSliderProps {
  banners: Banner[];
}

const AUTOPLAY_DELAY = 5500;

export function HeroSlider({ banners }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = banners && banners.length > 0 ? banners : null;

  // Fallback if no banners
  if (!slides) {
    return (
      <div className="relative w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[650px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center px-6 max-w-2xl relative z-10">
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
            Quality Products,<br />Unbeatable Prices
          </h1>
          <p className="text-xs sm:text-base md:text-lg text-slate-300 mb-8">
            Discover groceries, electronics, and fashion tailored for your needs.
          </p>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4">
            <Link
              href="/shop"
              className="px-5 py-2.5 md:px-8 md:py-3.5 bg-white text-slate-900 font-bold rounded-full hover:bg-slate-100 transition shadow-lg text-xs md:text-base flex items-center gap-2 group"
            >
              Shop Now <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/categories"
              className="px-5 py-2.5 md:px-8 md:py-3.5 bg-white/10 text-white font-bold rounded-full border border-white/30 hover:bg-white/20 transition text-xs md:text-base"
            >
              Browse Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="relative w-full h-[210px] sm:h-[480px] md:h-[550px] lg:h-[650px] overflow-hidden bg-black group/slider text-white">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, EffectFade]}
        effect="fade"
        speed={1000}
        autoplay={{
          delay: AUTOPLAY_DELAY,
          disableOnInteraction: false,
        }}
        loop={slides.length > 1}
        grabCursor={true}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        pagination={{
          el: '.swiper-pagination-custom',
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class="${className} custom-bullet"></span>`;
          },
        }}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="h-full w-full"
      >
        {slides.map((banner, index) => {
          const primaryHref = banner.primaryBtnLink || banner.link || '/shop';
          const primaryText = banner.primaryBtnText || 'Shop Now';
          const secondaryHref = banner.secondaryBtnLink || '/categories';
          const secondaryText = banner.secondaryBtnText;
          const isActive = index === activeIndex;

          return (
            <SwiperSlide key={banner._id || index} className="relative overflow-hidden">
              {/* Ken Burns zooming background */}
              <div
                className={`absolute inset-0 bg-cover bg-top transition-transform duration-[8000ms] ease-linear ${isActive ? 'scale-110' : 'scale-100'}`}
                style={{ backgroundImage: `url(${banner.image || '/placeholder-banner.jpg'})` }}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />

              {/* Content */}
              <div className="absolute inset-0 flex items-end pb-10 sm:pb-20 lg:pb-32 z-20 px-4 sm:px-12 md:px-20 lg:px-32">
                <div className="max-w-[95%] sm:max-w-xl lg:max-w-3xl flex flex-col items-start">
                  <AnimatePresence mode="wait">
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                      >

                        <motion.h1
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.7, delay: 0.3, ease: "easeOut" }}
                          className="text-base sm:text-4xl md:text-5xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-1 sm:mb-6 drop-shadow-2xl"
                        >
                          {banner.title}
                        </motion.h1>

                        {banner.subtitle && (
                          <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.45, ease: "easeOut" }}
                            className="text-[9px] sm:text-sm md:text-lg lg:text-xl text-white/80 max-w-[180px] sm:max-w-md md:max-w-lg mb-3 sm:mb-10 leading-snug drop-shadow-sm"
                          >
                            {banner.subtitle}
                          </motion.p>
                        )}

                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
                          className="flex flex-wrap items-center gap-1.5 sm:gap-5"
                        >
                          <Link
                            href={primaryHref}
                            className="flex items-center gap-1 px-3 py-1 sm:px-10 sm:py-4 bg-primary text-white font-bold rounded-full hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all text-[8px] sm:text-base shadow-2xl"
                          >
                            <span>{primaryText}</span>
                            <ArrowRight className="w-2 h-2 sm:w-4 sm:h-4" />
                          </Link>

                          {secondaryText && (
                            <Link
                              href={secondaryHref}
                              className="px-3 py-1 sm:px-10 sm:py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-full hover:bg-white/20 hover:border-white/40 transition-all text-[8px] sm:text-base shadow-sm"
                            >
                              {secondaryText}
                            </Link>
                          )}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* ── Custom Navigation ── */}
      {slides.length > 1 && (
        <>
          <button 
            type="button"
            className="swiper-button-prev-custom absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-6 h-6 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white opacity-0 group-hover/slider:opacity-100 hover:bg-primary hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-3 h-3 sm:w-7 sm:h-7" />
          </button>
          <button 
            type="button"
            className="swiper-button-next-custom absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-6 h-6 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white opacity-0 group-hover/slider:opacity-100 hover:bg-primary hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-3 h-3 sm:w-7 sm:h-7" />
          </button>

          {/* Custom Pagination Container */}
          <div className="absolute bottom-2.5 sm:bottom-12 left-0 w-full z-30 flex justify-center px-4 sm:px-10">
            <div className="swiper-pagination-custom flex items-center gap-1 sm:gap-3
                    [&_.custom-bullet]:w-1 
                    [&_.custom-bullet]:h-1 
                    sm:[&_.custom-bullet]:w-2 
                    sm:[&_.custom-bullet]:h-2 
                    [&_.custom-bullet]:bg-white/30 
                    [&_.custom-bullet]:rounded-full 
                    [&_.custom-bullet]:transition-all 
                    [&_.custom-bullet]:duration-300 
                    [&_.custom-bullet]:cursor-pointer
                    [&_.swiper-pagination-bullet-active]:w-4 
                    sm:[&_.swiper-pagination-bullet-active]:w-10
                    [&_.swiper-pagination-bullet-active]:bg-primary 
                    [&_.swiper-pagination-bullet-active]:rounded-full">
            </div>
          </div>

          {/* Progress Bar (Legacy style, but simplified) */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] sm:h-[3px] z-40 bg-white/5">
            <motion.div
              key={activeIndex}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: AUTOPLAY_DELAY / 1000, ease: "linear" }}
              className="h-full bg-primary"
            />
          </div>
        </>
      )}
    </section>
  );
}
