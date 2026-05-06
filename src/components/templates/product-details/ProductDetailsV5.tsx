/* eslint-disable @typescript-eslint/no-explicit-any */
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import ProductDetailsV5Client from './ProductDetailsV5Client';
import ProductCardV1 from '@/components/templates/product-cards/ProductCardV1';
import Script from 'next/script';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const sanitizeForScript = (json: any) => {
  return JSON.stringify(json).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
};

export default async function ProductDetailsV5({ product }: { product: any }) {
  if (!product) {
    notFound();
  }

  let related = [];
  try {
    await connectToDatabase();
    const relatedProducts = await Product.find({
      domain: product.domain,
      _id: { $ne: product._id },
      isPublished: true,
      $or: [
        { categories: { $in: (product.categories ?? []).map((cat: any) => cat._id ?? cat).filter(Boolean) } },
        { tags: { $in: (product.tags ?? []).map((tag: any) => tag._id ?? tag).filter(Boolean) } },
      ],
    })
      .populate('categories')
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();
    related = JSON.parse(JSON.stringify(relatedProducts));
  } catch (error) {
    console.error("Error fetching related products:", error);
    related = [];
  }

  const productSchema = generateProductSchema(product);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', item: '/' },
    { name: 'Shop', item: '/shop' },
    { name: product.name, item: `/product/${product.slug}` }
  ]);

  return (
    <div className="w-full">
      {productSchema && (
        <Script
          id="product-schema-v5"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: sanitizeForScript(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <Script
          id="breadcrumb-schema-v5"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: sanitizeForScript(breadcrumbSchema) }}
        />
      )}

      <ProductDetailsV5Client product={product} />

      {Array.isArray(related) && related.length > 0 && (
        <section className="bg-neutral-50 dark:bg-neutral-900 py-40">
          <div className="container px-4 md:px-0 mx-auto">
             <div className="flex flex-col items-center text-center mb-20 space-y-6">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.6em]">Continue the Story</span>
                <h2 className="text-5xl md:text-8xl font-serif italic tracking-tighter">Accompanying Pieces</h2>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
               {related.map((item: any) => (
                 <ProductCardV1 key={item._id} product={item} />
               ))}
             </div>
             <div className="flex justify-center mt-24">
                 <Button asChild variant="outline" className="h-20 px-16 rounded-full font-black uppercase tracking-[0.3em] text-xs border-2 hover:bg-primary hover:text-white transition-all duration-700">
                    <Link href="/shop">Explore Entire Narrative</Link>
                 </Button>
             </div>
          </div>
        </section>
      )}
    </div>
  );
}
