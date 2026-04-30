/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowRight } from 'lucide-react';
import connectToDatabase from '@/lib/db';
import Banner from '@/models/Banner';
import Category from '@/models/Category';
import Product from '@/models/Product';
import Blog from '@/models/Blog';
import FAQ from '@/models/FAQ';
import GlobalSettings from '@/models/GlobalSettings';
import Coupon from '@/models/Coupon';
import { HeroSlider } from '@/components/storefront/HeroSlider';
import { CategoryShowcase } from '@/components/storefront/CategoryShowcase';
import { ProductCarouselSection } from '@/components/storefront/ProductCarouselSection';
import { BlogRecent } from '@/components/storefront/BlogRecent';
import { FAQSection } from '@/components/storefront/FAQSection';
import { Testimonials } from '@/components/storefront/Testimonials';
import { FeaturesSection } from '@/components/storefront/FeaturesSection';
import { LoyaltyBanner } from '@/components/storefront/LoyaltyBanner';
import { ComboOfferBanner } from '@/components/storefront/ComboOfferBanner';
import { FreeDeliveryBanner } from '@/components/storefront/FreeDeliveryBanner';
import { NewsletterV2 } from '@/components/storefront/NewsletterV2';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getHomeData() {
  try {
    await connectToDatabase();

    const [
      bannersRaw,
      categoriesRaw,
      featuredProductsRaw,
      newArrivalsRaw,
      flashSaleRaw,
      trendingRaw,
      blogsRaw,
      faqsRaw,
      settingsRaw,
      activeCouponRaw
    ] = await Promise.all([
      Banner.find({ isActive: true }).sort({ order: 1 }).lean(),
      Category.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
      // Featured Products
      Product.find({ isPublished: true, isFeatured: true })
        .populate('categories')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      // New Arrivals
      Product.find({ isPublished: true, isNewArrival: true })
        .populate('categories')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      // Flash Sale (Items on sale)
      Product.find({ isPublished: true, salePrice: { $exists: true, $ne: null } })
        .populate('categories')
        .sort({ salePrice: 1 })
        .limit(10)
        .lean(),
      // Trending (Based on ratings/reviews)
      Product.find({ isPublished: true })
        .populate('categories')
        .sort({ ratings: -1, numReviews: -1 })
        .limit(10)
        .lean(),
      // Recent Blogs
      Blog.find({ isPublished: true }).sort({ createdAt: -1 }).limit(1).lean(),
      // FAQs
      FAQ.find({ isActive: true }).sort({ order: 1 }).lean(),
      // Global Settings for Loyalty Info
      GlobalSettings.findOne({}).lean(),
      // Active Coupon for Announcement
      Coupon.findOne({ isActive: true, expiryDate: { $gt: new Date() } }).sort({ createdAt: -1 }).lean()
    ]);


    const serialize = (data: any): any => JSON.parse(JSON.stringify(data));

    return {
      banners: serialize(bannersRaw),
      categories: serialize(categoriesRaw),
      featuredProducts: serialize(featuredProductsRaw),
      newArrivals: serialize(newArrivalsRaw),
      flashSale: serialize(flashSaleRaw),
      trending: serialize(trendingRaw),
      blogs: serialize(blogsRaw),
      faqs: serialize(faqsRaw && faqsRaw.length > 0 ? faqsRaw : []),
      settings: serialize(settingsRaw || null),
      activeCoupon: serialize(activeCouponRaw || null)
    };
  } catch (error) {
    console.error("Error fetching home data directly from DB:", error);
    return {
      banners: [],
      categories: [],
      featuredProducts: [],
      newArrivals: [],
      flashSale: [],
      trending: [],
      blogs: [],
      faqs: []
    };
  }
}

export default async function Home() {
  const data = await getHomeData();
  const hasAnyProducts =
    data.featuredProducts.length > 0 ||
    data.newArrivals.length > 0 ||
    data.flashSale.length > 0 ||
    data.trending.length > 0;

  return (
    <div className="flex flex-col min-h-screen">
      {/* 0. Free Delivery Announcement Bar */}
      <FreeDeliveryBanner settings={data.settings} />

      {/* 1. Hero Section */}
      <HeroSlider banners={data.banners} />





      {/* 4. Categories Showcase */}
      <CategoryShowcase categories={data.categories} />


      {/* 8. Featured Products */}
      {data.featuredProducts.length > 0 && (
        <ProductCarouselSection
          title="Featured Collections"
          description="Explore our best-selling and most popular products hand-picked just for you."
          products={data.featuredProducts}
          viewAllLink="/shop?filter=featured"
          bgColor="bg-background"
        />
      )}

      {/* 8. Loyalty Promotion */}
      <LoyaltyBanner settings={data.settings} />

      {/* 3. Flash Sale (Timed) */}
      {data.flashSale.length > 0 && (
        <ProductCarouselSection
          title="Flash Sale"
          products={data.flashSale}
          viewAllLink="/shop?filter=sale"
          isFlashSale={true}
          bgColor="bg-primary/5"
        />
      )}

      {/* 7. Combo Discount Promotion */}
      <ComboOfferBanner activeCoupon={data.activeCoupon} settings={data.settings} />

      {/* 6. Trending Products */}
      {data.trending.length > 0 && (
        <ProductCarouselSection
          title="Trending Now"
          description="The most popular items according to our community ratings and reviews."
          products={data.trending}
          viewAllLink="/shop?filter=trending"
          bgColor="bg-muted/20"
        />
      )}


      {/* 9. Recent Blogs section */}
      <BlogRecent blogs={data.blogs} />

      {/* 5. New Arrivals */}
      {data.newArrivals.length > 0 && (
        <ProductCarouselSection
          title="New Arrivals"
          description="Discover the latest additions to our collection. Stay ahead of the curve."
          products={data.newArrivals}
          viewAllLink="/shop?filter=new"
          bgColor="bg-background"
        />
      )}



      {/* 2. Our Features (Trust Badges) */}
      <FeaturesSection />

      {/* 8. Testimonials Section */}
      <Testimonials />



      {/* 10. FAQ Accordion Section */}
      <FAQSection faqs={data.faqs} />

      {/* 11. Newsletter V2 Integration */}
      <NewsletterV2 />
    </div>
  );
}
