/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import ProductDetailsClient from './ProductDetailsClient';
import ProductCardV1 from '@/components/templates/product-cards/ProductCardV1';
import Script from 'next/script';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo';

const sanitizeForScript = (json: any) => {
  return JSON.stringify(json).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
};

export default async function ProductDetailsV1({ product }: { product: any }) {
  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Link href="/shop">
          <Button variant="link" className="mt-4">
            Back to Shop
          </Button>
        </Link>
      </div>
    );
  }

  let related = [];
  try {
    await connectToDatabase();
    const relatedProducts = await Product.find({
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
    <div className="container px-4 md:px-0 mx-auto py-10">
      {productSchema && (
        <script
          id="product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: sanitizeForScript(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          id="breadcrumb-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: sanitizeForScript(breadcrumbSchema) }}
        />
      )}

      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium truncate">{product.name}</span>
      </div>

      <div className="p-0 md:p-4">
        <ProductDetailsClient product={product} />
      </div>

      {Array.isArray(related) && related.length > 0 && (
        <section className="mt-20">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">You May Also Like</h2>
              <p className="text-muted-foreground mt-1">Similar picks based on this product&apos;s category and tags.</p>
            </div>
            <Link href="/shop">
               <Button variant="outline">Explore More</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((item: any) => (
              <ProductCardV1 key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
