/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import ProductDetailsV2Client from './ProductDetailsV2Client';
import ProductCardV1 from '@/components/templates/product-cards/ProductCardV1';
import Script from 'next/script';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { notFound } from 'next/navigation';

const sanitizeForScript = (json: any) => {
  return JSON.stringify(json).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
};

export default async function ProductDetailsV2({ product }: { product: any }) {
  if (!product) {
    notFound();
  }

  let related: any[] = [];
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
    { name: product.name || 'Product', item: `/product/${product.slug || 'unknown-product'}` }
  ]);

  return (
    <div className="container px-4 md:px-8 mx-auto py-10">
      {productSchema && (
        <Script
          id="product-schema-v2"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: sanitizeForScript(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <Script
          id="breadcrumb-schema-v2"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: sanitizeForScript(breadcrumbSchema) }}
        />
      )}

      {/* Luxury Breadcrumb */}
      <div className="mb-12 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 overflow-hidden">
        <Link href="/" className="hover:text-primary transition-colors shrink-0">Discovery</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <Link href="/shop" className="hover:text-primary transition-colors shrink-0">Collection</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <span className="text-foreground truncate">{product.name}</span>
      </div>

      <ProductDetailsV2Client product={product} />

      {Array.isArray(related) && related.length > 0 && (
        <section className="mt-40 border-t pt-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter">You May Also Seek</h2>
              <p className="text-muted-foreground max-w-lg text-lg font-medium">Elevate your selection with these curated alternatives chosen specifically for your taste.</p>
            </div>
            <Link href="/shop">
               <Button variant="outline" className="h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-xs border-2">Explore Full Collection</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {related.map((item: any) => (
              <ProductCardV1 key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
