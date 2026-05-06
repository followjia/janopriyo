/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import ProductDetailsV4Client from './ProductDetailsV4Client';
import ProductCardV1 from '@/components/templates/product-cards/ProductCardV1';
import Script from 'next/script';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { notFound } from 'next/navigation';

const sanitizeForScript = (json: any) => {
  return JSON.stringify(json).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
};

export default async function ProductDetailsV4({ product }: { product: any }) {
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
    { name: product.name || 'Product', item: `/product/${product.slug || 'unknown-product'}` }
  ]);

  return (
    <div className="container px-4 md:px-16 mx-auto py-10">
      {productSchema && (
        <script
          id="product-schema-v4"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: sanitizeForScript(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          id="breadcrumb-schema-v4"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: sanitizeForScript(breadcrumbSchema) }}
        />
      )}

      {/* Boutique Breadcrumb */}
      <div className="mb-20 flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-[0.4em] text-muted-foreground/40">
        <Link href="/" className="hover:text-primary transition-colors">Atelier</Link>
        <span className="h-1 w-1 rounded-full bg-neutral-200" />
        <Link href="/shop" className="hover:text-primary transition-colors">Showroom</Link>
        <span className="h-1 w-1 rounded-full bg-neutral-200" />
        <span className="text-foreground font-black truncate">{product.name}</span>
      </div>

      <ProductDetailsV4Client product={product} />

      {Array.isArray(related) && related.length > 0 && (
        <section className="mt-40 pt-24 border-t border-dashed">
          <div className="text-center mb-20 space-y-4">
             <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em]">You May Also Adore</span>
             <h2 className="text-4xl md:text-6xl font-serif italic tracking-tight">Handpicked for You</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {related.map((item: any) => (
              <ProductCardV1 key={item._id} product={item} />
            ))}
          </div>
          <div className="flex justify-center mt-16">
             <Link href="/shop">
                <Button variant="outline" className="h-16 px-12 rounded-full font-black uppercase tracking-widest text-[10px] border-2">Explore the Atelier</Button>
             </Link>
          </div>
        </section>
      )}
    </div>
  );
}
