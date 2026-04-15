import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface HeroSliderProps {
  banners: any[];
}

export function HeroSlider({ banners }: HeroSliderProps) {
  if (!banners || banners.length === 0) {
    return (
      <div className="relative h-[400px] md:h-[600px] w-full bg-muted flex items-center justify-center overflow-hidden">
        <div className="container relative z-10 text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter" data-aos="fade-up">
            Quality Products, <br /> Unbeatable Prices
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-[600px] mx-auto" data-aos="fade-up" data-aos-delay="200">
            Discover a wide range of groceries, electronics, and fashion tailored for your needs.
          </p>
          <div className="flex gap-4 justify-center" data-aos="fade-up" data-aos-delay="400">
            <Link href="/shop">
              <Button size="lg">Shop Now</Button>
            </Link>
            <Link href="/categories">
              <Button size="lg" variant="outline">Browse Categories</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Carousel className="w-full overflow-hidden" opts={{ loop: true }}>
      <CarouselContent>
        {banners.map((banner, index) => (
          <CarouselItem key={banner._id || index}>
            <div className="relative h-[400px] md:h-[600px] w-full overflow-hidden">
              <img 
                src={banner.image || '/placeholder-banner.jpg'} 
                alt={banner.title || 'Promotional banner'} 
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center">
                <div className="container px-4 md:px-6">
                  <div className="max-w-[600px] space-y-6 text-white">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tighter" data-aos="fade-right">
                      {banner.title}
                    </h1>
                    <div className="flex flex-wrap gap-4" data-aos="fade-up">
                      {/* Primary Button */}
                      {(banner.primaryBtnLink || banner.primaryBtnText) && (
                        <Link href={banner.primaryBtnLink || '#'}>
                          <Button size="lg" className="bg-white text-black hover:bg-white/90">
                            {banner.primaryBtnText || 'Shop Now'}
                          </Button>
                        </Link>
                      )}
                      
                      {/* Secondary Button */}
                      {(banner.secondaryBtnLink || banner.secondaryBtnText) && (
                        <Link href={banner.secondaryBtnLink || '#'}>
                          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                            {banner.secondaryBtnText || 'Learn More'}
                          </Button>
                        </Link>
                      )}
                      
                      {/* Fallback Legacy Link (only if both new buttons are empty) */}
                      {!banner.primaryBtnLink && !banner.primaryBtnText && 
                       !banner.secondaryBtnLink && !banner.secondaryBtnText && 
                       banner.link && (
                        <Link href={banner.link}>
                          <Button size="lg" className="bg-white text-black hover:bg-white/90">
                            Shop Now
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-4" />
      <CarouselNext className="right-4" />
    </Carousel>
  );
}
