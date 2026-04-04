'use client';

import Link from 'next/link';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { toggleWishlist } from '@/store/slices/wishlistSlice';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    salePrice?: number;
    images: string[];
    isFeatured?: boolean;
    stock: number;
    categories?: any[];
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const wishlist = useAppSelector((state) => state.wishlist.items);
  const isInWishlist = wishlist.includes(product._id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: (product.salePrice !== undefined && product.salePrice !== null) ? product.salePrice : product.price,
      quantity: 1,
      image: product.images?.[0]
    }));
    toast.success(`${product.name} added to cart`);
  };

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Toggle locally (optimistic update)
    dispatch(toggleWishlist(product._id));
    
    // Determine the message based on the NEW state
    const willBeInWishlist = !isInWishlist;
    toast.success(willBeInWishlist ? 'Added to wishlist' : 'Removed from wishlist');
    
    // If authenticated, also update database
    if (session) {
      try {
        const res = await fetch('/api/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product._id }),
        });
        
        if (!res.ok) {
           throw new Error('Failed to update wishlist server-side');
        }
      } catch (err) {
        console.error('API toggle error:', err);
        // Rollback optimistic update
        dispatch(toggleWishlist(product._id));
        toast.error('Failed to sync wishlist. Please try again.');
      }
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    // TODO: Implement Quick View functionality
    toast.info('Quick View coming soon!');
  };

  const discount = (product.salePrice !== undefined && product.salePrice !== null && product.price > 0) 
    ? Math.max(0, Math.round(((product.price - product.salePrice) / product.price) * 100)) 
    : 0;

  return (
    <div 
        className="group relative flex flex-col overflow-hidden rounded-lg border bg-background transition-all hover:shadow-xl"
        data-aos="fade-up"
    >
      <Link href={`/product/${product.slug}`} className="relative aspect-square overflow-hidden bg-muted">
        {product.images?.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            No image
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
            {discount > 0 && (
                <Badge variant="destructive" className="font-bold">-{discount}%</Badge>
            )}
            {product.isFeatured && (
                <Badge variant="default" className="bg-primary hover:bg-primary font-bold uppercase text-[10px]">Featured</Badge>
            )}
            {product.stock === 0 && (
                <Badge variant="secondary" className="font-bold uppercase text-[10px]">Out of Stock</Badge>
            )}
        </div>

        {/* Hover Actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black/5">
            <Button 
                size="icon" 
                variant="secondary" 
                className="h-9 w-9 rounded-full shadow-lg hover:scale-110 transition-transform"
                onClick={handleFavorite}
                aria-label={isInWishlist ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
            >
                <Heart className={`h-4 w-4 ${isInWishlist ? 'fill-destructive text-destructive' : ''}`} />
            </Button>
            <Button 
                size="icon" 
                variant="secondary" 
                className="h-9 w-9 rounded-full shadow-lg hover:scale-110 transition-transform"
                onClick={handleQuickView}
                aria-label={`View ${product.name} details`}
            >
                <Eye className="h-4 w-4" />
            </Button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2">
            <Link 
                href={`/product/${product.slug}`}
                className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
            >
                {product.name}
            </Link>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className={(product.salePrice !== undefined && product.salePrice !== null) ? 'text-xs line-through text-muted-foreground' : 'font-bold text-lg'}>
              ${product.price ? product.price.toFixed(2) : '0.00'}
            </span>
            {(product.salePrice !== undefined && product.salePrice !== null) && (
              <span className="font-bold text-lg text-primary">
                ${product.salePrice.toFixed(2)}
              </span>
            )}
          </div>
          <Button 
            size="sm" 
            className="h-8 w-8 rounded-full p-0 flex items-center justify-center"
            disabled={product.stock === 0}
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingCart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
