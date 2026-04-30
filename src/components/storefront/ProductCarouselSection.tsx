/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/storefront/ProductCard';
import Link from 'next/link';

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
  bgColor = "bg-background"
}: ProductCarouselSectionProps) {

  if (!products || products.length === 0) return null;

  return (
    <section className={`py-12 ${bgColor}`}>
      <div className="container mx-auto px-4">

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

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {products.map((product) => (
            <ProductCard 
              key={product._id} 
              product={product} 
              isFlashSale={isFlashSale} 
            />
          ))}
        </div>

      </div>
    </section>
  );
}