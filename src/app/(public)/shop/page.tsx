import { Suspense } from 'react';
import { getCachedProducts, getCachedCategories } from '@/lib/data-fetching';
import ShopClient from './ShopClient';
import { ShopHeaderSkeleton, ProductCardSkeleton } from '@/components/storefront/Skeletons';

export const metadata = {
  title: 'Shop | Janopriyo Shop',
  description: 'Discover Products That Match Your Style. Filter by category, budget, and latest arrivals.',
};

export default async function ShopPage() {
  // Fetch initial data on the server with caching
  const [initialProducts, initialCategories] = await Promise.all([
    getCachedProducts({}, 1000), // Get a large batch for client-side filtering
    getCachedCategories(),
  ]);

  return (
    <Suspense fallback={
      <div className="container py-10">
        <ShopHeaderSkeleton />
        <div className="flex flex-col gap-8 md:flex-row">
          <aside className="hidden w-64 shrink-0 md:block">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          </aside>
          <div className="flex-1">
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <ShopClient 
        initialProducts={initialProducts} 
        initialCategories={initialCategories} 
      />
    </Suspense>
  );
}
