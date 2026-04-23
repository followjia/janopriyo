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
import { FeaturedProducts } from '@/components/storefront/FeaturedProducts';
import { FlashSale } from '@/components/storefront/FlashSale';
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
        .limit(8)
        .lean(),
      // New Arrivals
      Product.find({ isPublished: true, isNewArrival: true })
        .populate('categories')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
      // Flash Sale (Items on sale)
      Product.find({ isPublished: true, salePrice: { $exists: true, $ne: null } })
        .populate('categories')
        .sort({ discountRate: -1 })
        .limit(4)
        .lean(),
      // Trending (Based on ratings/reviews)
      Product.find({ isPublished: true })
        .populate('categories')
        .sort({ ratings: -1, numReviews: -1 })
        .limit(4)
        .lean(),
      // Recent Blogs
      Blog.find({ isPublished: true }).sort({ createdAt: -1 }).limit(3).lean(),
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
      categories: serialize(categoriesRaw).slice(0, 6),
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

      {/* 2. Our Features (Trust Badges) */}
      <FeaturesSection />

      {/* 3. Flash Sale (Timed) */}
      <FlashSale products={data.flashSale} />

      {/* 4. Categories Showcase */}
      <CategoryShowcase categories={data.categories} />

      {/* 5. New Arrivals */}
      <section className="py-20">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-black tracking-tighter">New Arrivals</h2>
            <Link href="/shop?filter=new" className="text-sm font-bold text-primary hover:underline flex items-center gap-1 group">
              View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.newArrivals.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          {!hasAnyProducts && (
            <div className="mt-8 text-center rounded-2xl border border-dashed p-10 bg-muted/20">
              <h3 className="text-xl font-bold mb-2">Storefront is getting ready</h3>
              <p className="text-muted-foreground mb-4">Add products from admin to make this section live.</p>
              <Button render={<Link href="/shop" />} nativeButton={false}>
                Visit Shop
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* 6. Trending Products */}
      <section className="py-20 bg-muted/20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center space-y-4 mb-16">
            <h2 className="text-4xl font-black tracking-tighter">Trending Now</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              The most popular items according to our community ratings and reviews.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.trending.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* 7. Combo Discount Promotion */}
      <ComboOfferBanner activeCoupon={data.activeCoupon} settings={data.settings} />

      {/* 8. Loyalty Promotion */}
      <LoyaltyBanner settings={data.settings} />

      {/* 8. Featured Products (Existing) */}
      <FeaturedProducts products={data.featuredProducts} />

      {/* 8. Testimonials Section */}
      <Testimonials />

      {/* 9. Recent Blogs section */}
      <BlogRecent blogs={data.blogs} />

      {/* 10. FAQ Accordion Section */}
      <FAQSection faqs={data.faqs} />

      {/* 11. Newsletter V2 Integration */}
      <NewsletterV2 />
    </div>
  );
}
