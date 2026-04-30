/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Metadata } from 'next';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { cache } from 'react';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import ProductDetailsClient from './ProductDetailsClient';
import { ProductCard } from '@/components/storefront/ProductCard';

const sanitizeForScript = (json: any) => {
  return JSON.stringify(json).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
};

const getProduct = cache(async (slug: string) => {
  try {
    await connectToDatabase();
    // Use lean() for better performance and plain object return
    const product = await Product.findOne({ slug })
      .populate('categories')
      .lean();

    if (!product) return null;

    // Stringify ObjectIDs and other non-serializable fields for client components
    return JSON.parse(JSON.stringify(product));
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product Not Found' };

  const safeDescription = (product.description ?? '').slice(0, 160);
  const mainImage = product.images?.[0] ? [{ url: product.images[0] }] : [];
  const twitterImage = product.images?.[0] ? [product.images[0]] : [];

  return {
    title: product.name,
    description: safeDescription,
    openGraph: {
      title: product.name,
      description: safeDescription,
      images: mainImage,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: safeDescription,
      images: twitterImage,
    }
  };
}

import Script from 'next/script';

export default async function ProductDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Button variant="link" className="mt-4" render={<Link href="/shop" />} nativeButton={false}>
          Back to Shop
        </Button>
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
        { categories: { $in: (product.categories ?? []).map((category: { _id: string }) => category._id) } },
        { tags: { $in: product.tags || [] } },
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
    <div className="container px-4 md:px-0 mx-auto py-10">
      {productSchema && (
        <Script
          id="product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: sanitizeForScript(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <Script
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

      <div className="rounded-3xl border bg-card/40 p-4 md:p-8">
        <ProductDetailsClient product={product} />
      </div>

      {Array.isArray(related) && related.length > 0 && (
        <section className="mt-20">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">You May Also Like</h2>
              <p className="text-muted-foreground mt-1">Similar picks based on this product&apos;s category and tags.</p>
            </div>
            <Button variant="outline" render={<Link href="/shop" />} nativeButton={false}>
              Explore More
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((item: any) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
