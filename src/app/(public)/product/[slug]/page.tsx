/* eslint-disable @typescript-eslint/no-explicit-any */
import { 
    ShoppingCart, 
    Heart, 
    ChevronRight, 
    Truck, 
    ShieldCheck, 
    RotateCcw,
    Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Metadata } from 'next';
import { generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo';
import { cache } from 'react';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import ProductDetailsClient from './ProductDetailsClient'; 
 
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

  const productSchema = generateProductSchema(product);
  const breadcrumbSchema = generateBreadcrumbSchema([
      { name: 'Home', item: '/' },
      { name: 'Shop', item: '/shop' },
      { name: product.name, item: `/product/${product.slug}` }
  ]);

  return (
    <div className="container px-4 md:px-6 py-10">
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: sanitizeForScript(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
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

      <ProductDetailsClient product={product} />
    </div>
  );
}
