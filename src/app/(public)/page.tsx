import { ArrowRight, Truck, ShieldCheck, Headphones, Zap } from 'lucide-react';
import connectToDatabase from '@/lib/db';
import Banner from '@/models/Banner';
import Category from '@/models/Category';
import Product from '@/models/Product';
import { HeroSlider } from '@/components/storefront/HeroSlider';
import { CategoryShowcase } from '@/components/storefront/CategoryShowcase';
import { FeaturedProducts } from '@/components/storefront/FeaturedProducts';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

async function getHomeData() {
  try {
    await connectToDatabase();
    
    // Direct database queries are more reliable and efficient for Server Components.
    const [bannersRaw, categoriesRaw, productsRaw] = await Promise.all([
      Banner.find({ isActive: true }).sort({ order: 1 }).lean(),
      Category.find({ isActive: true }).sort({ createdAt: -1 }).lean(),
      Product.find({ isPublished: true, isFeatured: true })
        .populate('categories')
        .sort({ createdAt: -1 })
        .limit(8)
        .lean()
    ]);

    // Serialize MongoDB objects (like _id) to plain objects for Client Component safety
    const banners = JSON.parse(JSON.stringify(bannersRaw));
    const categories = JSON.parse(JSON.stringify(categoriesRaw));
    const products = JSON.parse(JSON.stringify(productsRaw));

    return {
      banners: Array.isArray(banners) ? banners : [],
      categories: Array.isArray(categories) ? categories.slice(0, 6) : [],
      products: Array.isArray(products) ? products : []
    };
  } catch (error) {
    console.error("Error fetching home data directly from DB:", error);
    return { banners: [], categories: [], products: [] };
  }
}

export default async function Home() {
  const data = await getHomeData();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <HeroSlider banners={data.banners} />

      {/* Trust Badges */}
      <section className="border-y bg-muted/20 py-10 overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-center gap-4 group" data-aos="fade-up">
              <div className="rounded-full bg-primary/10 p-3 text-primary transition-transform group-hover:scale-110">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Free Delivery</h3>
                <p className="text-xs text-muted-foreground">On all orders over $1000</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group" data-aos="fade-up" data-aos-delay="100">
              <div className="rounded-full bg-primary/10 p-3 text-primary transition-transform group-hover:scale-110">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Secure Payment</h3>
                <p className="text-xs text-muted-foreground">100% secure payment methods</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group" data-aos="fade-up" data-aos-delay="200">
              <div className="rounded-full bg-primary/10 p-3 text-primary transition-transform group-hover:scale-110">
                <Headphones className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm">24/7 Support</h3>
                <p className="text-xs text-muted-foreground">Live chat and phone support</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group" data-aos="fade-up" data-aos-delay="300">
              <div className="rounded-full bg-primary/10 p-3 text-primary transition-transform group-hover:scale-110">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Flash Deals</h3>
                <p className="text-xs text-muted-foreground">Daily deals and promotions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <CategoryShowcase categories={data.categories} />

      {/* Featured Products Section */}
      <FeaturedProducts products={data.products} />

      {/* Newsletter / Call to Action */}
      <section className="bg-primary py-16 text-primary-foreground overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6" data-aos="fade-right">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tighter leading-tight">
                Join the Janopriyo <br /> Shop Community
              </h2>
              <p className="text-primary-foreground/80 md:text-xl">
                Create an account today to track your orders, manage your wishlist, and stay updated with our newest collections.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/shop">
                    <Button size="lg" className="bg-white text-black hover:bg-white/90">
                        Explore Collection <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
                <Link href="/auth/register">
                    <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                        Create Account
                    </Button>
                </Link>
              </div>
            </div>
            <div className="relative hidden lg:block" data-aos="fade-left" data-aos-delay="200">
                <div className="absolute -inset-4 bg-white/10 rounded-full blur-3xl" />
                <div className="relative border-4 border-white/20 rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
                   <div className="bg-zinc-900 aspect-video flex items-center justify-center text-4xl font-bold text-white/20">
                      Janopriyo
                   </div>
                </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
