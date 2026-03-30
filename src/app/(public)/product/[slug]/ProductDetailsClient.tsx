'use client';

import { useState, useEffect } from 'react';
import { 
    ShoppingCart, 
    Heart, 
    Minus, 
    Plus, 
    Truck, 
    ShieldCheck, 
    RotateCcw,
    Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAppDispatch } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { toast } from 'sonner';

interface ProductDetailsClientProps {
  product: any;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const dispatch = useAppDispatch();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Reset image selection when product changes
  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
  }, [product._id]);

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product._id,
      name: product.name,
      price: product.salePrice || product.price,
      quantity: quantity,
      image: product.images?.[0]
    }));
    toast.success(`Added ${quantity} ${product.name} to cart`);
  };

  const discount = (product.price > 0 && product.salePrice && product.salePrice < product.price) 
    ? Math.max(0, Math.round(((product.price - product.salePrice) / product.price) * 100)) 
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Gallery Section */}
      <div className="space-y-4">
        <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
          {product.images && product.images.length > 0 && selectedImage < product.images.length ? (
            <img 
              src={product.images[selectedImage]} 
              alt={product.name} 
              className="h-full w-full object-contain p-4"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground italic">
                No images available
            </div>
          )}
          {discount > 0 && (
              <div className="absolute top-4 left-4">
                  <Badge variant="destructive" className="font-bold text-sm px-3 h-8 shadow-lg">-{discount}% OFF</Badge>
              </div>
          )}
        </div>
        <div className="flex gap-4 overflow-auto pb-2 scrollbar-none">
          {product.images?.map((img: string, i: number) => (
            <button
              key={i}
              className={`relative h-20 w-20 flex-shrink-0 rounded-md border-2 overflow-hidden transition-all ${
                selectedImage === i ? 'border-primary ring-2 ring-primary/20 scale-105' : 'border-muted hover:border-primary/50'
              }`}
              onClick={() => setSelectedImage(i)}
            >
              <img src={img} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Product Info Section */}
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
              {product.categories?.map((cat: any) => (
                  <Badge key={cat._id} variant="outline" className="text-[10px] uppercase font-bold tracking-widest text-primary italic">
                      {cat.name}
                  </Badge>
              ))}
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{product.name}</h1>
          {product.rating > 0 && (
            <div className="flex items-center gap-4 py-2">
              <div className="flex gap-0.5 text-yellow-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-muted'}`} 
                      />
                  ))}
              </div>
              <span className="text-sm text-muted-foreground">({product.rating.toFixed(1)} / 5.0)</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-4">
            <span className="text-3xl font-extrabold text-primary">
              ${(product.salePrice || product.price).toFixed(2)}
            </span>
            {product.salePrice && (
              <span className="text-xl text-muted-foreground line-through font-medium">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          <p className={`text-xs font-bold mt-1 ${product.stock > 0 ? 'text-green-600' : 'text-destructive'}`}>
            {product.stock > 0 ? 'In stock, ready to ship.' : 'Out of stock'}
          </p>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          {product.description}
        </p>

        <Separator />

        {/* Attributes */}
        <div className="space-y-4">
            {product.attributes?.map((attr: any, i: number) => (
                <div key={i} className="flex items-center gap-4">
                    <span className="text-sm font-bold min-w-[80px] uppercase tracking-wider">{attr.key}:</span>
                    <Badge variant="secondary">{attr.value}</Badge>
                </div>
            ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
          <div className="flex items-center border rounded-full overflow-hidden h-12 bg-muted/50">
              <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-full rounded-none px-4 hover:bg-muted"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                  <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center font-bold">{quantity}</span>
              <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-full rounded-none px-4 hover:bg-muted"
                  onClick={() => setQuantity(quantity + 1)}
              >
                  <Plus className="h-4 w-4" />
              </Button>
          </div>
          <Button 
              size="lg" 
              className="flex-1 h-12 rounded-full font-bold uppercase tracking-wider transition-all hover:scale-[1.02] shadow-xl shadow-primary/20"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
          >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
          </Button>
          <Button size="icon" variant="outline" className="h-12 w-12 rounded-full">
              <Heart className="h-5 w-5" />
          </Button>
        </div>

        {/* Trust Factors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t mt-10">
            <div className="flex flex-col items-center gap-2 text-center group">
                <div className="p-3 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    <Truck className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-tighter">Express Delivery</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center group">
                <div className="p-3 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-tighter">Safe & Secure</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-center group">
                <div className="p-3 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors">
                    <RotateCcw className="h-6 w-6 text-primary" />
                </div>
                <span className="text-xs font-bold uppercase tracking-tighter">Easy Returns</span>
            </div>
        </div>
      </div>
    </div>
  );
}
