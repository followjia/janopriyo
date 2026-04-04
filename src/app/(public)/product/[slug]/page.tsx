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
import ProductDetailsClient from './ProductDetailsClient'; // We'll create this for interaction
 
const sanitizeForScript = (json: any) => {
  return JSON.stringify(json).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
};

async function getProduct(slug: string) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/products`, { 
        cache: 'force-cache', 
        next: { tags: ['products'] } 
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data)) return null;
    return data.find((p: any) => p.slug === slug);
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const product = await getProduct(params.slug);
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

export default async function ProductDetailsPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  if (!product) {
    return (
      <div className="container py-20 text-center">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Button variant="link" className="mt-4" render={<Link href="/shop" />}>
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: sanitizeForScript(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: sanitizeForScript(breadcrumbSchema) }} />
      
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
