/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import ProductDetailsV3Client from './ProductDetailsV3Client';
import ProductCardV1 from '@/components/templates/product-cards/ProductCardV1';
import Script from 'next/script';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { notFound } from 'next/navigation';

const sanitizeForScript = (json: any) => {
  return JSON.stringify(json).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
};

export default async function ProductDetailsV3({ product }: { product: any }) {
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
    <div className="container px-4 md:px-12 mx-auto py-10">
      {productSchema && (
        <Script
          id="product-schema-v3"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: sanitizeForScript(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <Script
          id="breadcrumb-schema-v3"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: sanitizeForScript(breadcrumbSchema) }}
        />
      )}

      {/* Industrial Breadcrumb */}
      <div className="mb-16 flex items-center gap-3 text-[10px] font-mono font-black uppercase tracking-[0.4em] text-muted-foreground/60">
        <Link href="/" className="hover:text-primary transition-colors">ROOT</Link>
        <span className="opacity-20">/</span>
        <Link href="/shop" className="hover:text-primary transition-colors">CATALOG</Link>
        <span className="opacity-20">/</span>
        <span className="text-foreground truncate">{product.name}</span>
      </div>

      <ProductDetailsV3Client product={product} />

      {Array.isArray(related) && related.length > 0 && (
        <section className="mt-40 border-t-2 border-neutral-100 dark:border-neutral-800 pt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
            <div className="space-y-4">
              <span className="text-[10px] font-mono font-black text-primary uppercase tracking-[0.5em]">RELATED_LOGS</span>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase">Cross Reference</h2>
              <p className="text-muted-foreground max-w-lg font-mono text-xs uppercase tracking-widest leading-relaxed">System identified these items as highly compatible with your current selection.</p>
            </div>
            <Link href="/shop">
               <Button variant="outline" className="h-16 px-10 rounded-none font-mono font-black uppercase tracking-widest text-[10px] border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all">VIEW_ALL_RECORDS</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {related.map((item: any) => (
              <ProductCardV1 key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
