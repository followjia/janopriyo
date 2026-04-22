/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addToCart } from '@/store/slices/cartSlice';
import { toggleWishlist } from '@/store/slices/wishlistSlice';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import ReviewsSection from '@/components/storefront/ReviewsSection';

interface ProductDetailsClientProps {
  product: any;
}

export default function ProductDetailsClient({ product }: ProductDetailsClientProps) {
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const wishlist = useAppSelector((state) => state.wishlist.items);
  const isInWishlist = wishlist.includes(product?._id);

  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, percentageX: 0, percentageY: 0 });
  const [showZoom, setShowZoom] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedOthers, setSelectedOthers] = useState<string | null>(null);

  // Derive available options from variants
  const uniqueColors = useMemo(() => 
    Array.from(new Set((product.variants || []).map((v: any) => v.color))).filter(Boolean) as string[],
    [product.variants]
  );
  
  const uniqueSizes = useMemo(() => 
    Array.from(new Set((product.variants || []).map((v: any) => v.size))).filter(Boolean) as string[],
    [product.variants]
  );
  
  const uniqueOthers = useMemo(() => 
    Array.from(new Set((product.variants || []).map((v: any) => v.others))).filter(Boolean) as string[],
    [product.variants]
  );
  
  // Hierarchical filtering
  const availableSizes = useMemo(() => 
    (product.variants || [])
      .filter((v: any) => !selectedColor || v.color === selectedColor)
      .map((v: any) => v.size)
      .filter(Boolean) as string[],
    [product.variants, selectedColor]
  );

  const availableOthers = useMemo(() => 
    (product.variants || [])
      .filter((v: any) => (!selectedColor || v.color === selectedColor) && (!selectedSize || v.size === selectedSize))
      .map((v: any) => v.others)
      .filter(Boolean) as string[],
    [product.variants, selectedColor, selectedSize]
  );

  const activeVariant = useMemo(() => 
    (product.variants || []).find(
      (v: any) => 
        (v.color || null) === (selectedColor || null) && 
        (v.size || null) === (selectedSize || null) &&
        (v.others || null) === (selectedOthers || null)
    ),
    [product.variants, selectedColor, selectedSize, selectedOthers]
  );

  // Auto-select first available options on mount or product change
  useEffect(() => {
    if (!product) return;
    
    const initialColor = uniqueColors[0] || null;
    setSelectedColor(initialColor);
    
    const initialSizes = (product.variants || [])
      .filter((v: any) => !initialColor || v.color === initialColor)
      .map((v: any) => v.size)
      .filter(Boolean);
    const initialSize = initialSizes[0] || null;
    setSelectedSize(initialSize);

    const initialOthersList = (product.variants || [])
      .filter((v: any) => (!initialColor || v.color === initialColor) && (!initialSize || v.size === initialSize))
      .map((v: any) => v.others)
      .filter(Boolean);
    setSelectedOthers(initialOthersList[0] || null);
    
    setSelectedImage(0);
    setQuantity(1);
  }, [product?._id, uniqueColors, product.variants]);

  // Adjust selection if dependencies change and current choice is unavailable
  useEffect(() => {
    if (selectedSize == null || !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0] || null);
    }
    if (selectedOthers == null || !availableOthers.includes(selectedOthers)) {
      setSelectedOthers(availableOthers[0] || null);
    }
    
    // Update main image if variant has one
    if (activeVariant?.image) {
      const variantImgIndex = (product.images || []).findIndex((img: string) => img === activeVariant.image);
      if (variantImgIndex !== -1) {
        setSelectedImage(variantImgIndex);
      }
    }
  }, [selectedColor, selectedSize, selectedOthers, availableSizes, availableOthers, activeVariant, product.images]);

  const displayPrice = activeVariant?.price || product.price;
  const displaySalePrice = activeVariant?.salePrice || product.salePrice;
  const displayStock = activeVariant?.stock ?? product.stock;
  const displaySku = activeVariant?.sku || product.sku;
  const handleAddToCart = () => {
    if (uniqueColors.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }
    if (uniqueSizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (uniqueOthers.length > 0 && !selectedOthers) {
      toast.error('Please select an option');
      return;
    }

    const stock = displayStock || 0;
    const finalQuantity = Math.min(quantity, stock);

    if (finalQuantity <= 0) {
      toast.error('This item is currently out of stock');
      return;
    }

    const cartItemId = `${product._id}-${selectedColor || ''}-${selectedSize || ''}-${selectedOthers || ''}`;

    dispatch(addToCart({
      id: cartItemId,
      name: product.name,
      price: displaySalePrice || displayPrice,
      quantity: finalQuantity,
      image: activeVariant?.image || product.images?.[0],
      color: selectedColor || undefined,
      size: selectedSize || undefined,
      others: selectedOthers || undefined
    }));
    toast.success(`Added ${finalQuantity} ${product.name} to cart`);
  };

  const handleFavorite = async () => {
    if (!product?._id) return;
    
    if (!session) {
      toast.error('Please login to add to wishlist');
      return;
    }

    // Toggle locally (optimistic update)
    dispatch(toggleWishlist(product._id));
    
    // Determine the message based on the NEW state
    const willBeInWishlist = !isInWishlist;
    const successMsg = willBeInWishlist ? 'Added to wishlist' : 'Removed from wishlist';

    // If authenticated, update database and wait for response
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id }),
      });
      
      if (!res.ok) {
         throw new Error('Failed to update wishlist server-side');
      }
      
      // Only show success toast after server confirmation
      toast.success(successMsg);
    } catch (err) {
      console.error('API toggle error:', err);
      // Rollback optimistic update
      dispatch(toggleWishlist(product._id));
      toast.error('Failed to sync wishlist. Please try again.');
    }
  };

  const discount = (product.price > 0 && product.salePrice && product.salePrice < product.price) 
    ? Math.max(0, Math.round(((product.price - product.salePrice) / product.price) * 100)) 
    : 0;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    
    // Lens size (150x150) - sync with CSS
    const lensWidth = 150;
    const lensHeight = 150;
    
    // Calculate cursor pos relative to container
    let x = e.clientX - left;
    let y = e.clientY - top;
    
    // Clamp lens to stay within boundaries
    x = Math.max(lensWidth/2, Math.min(x, width - lensWidth/2));
    y = Math.max(lensHeight/2, Math.min(y, height - lensHeight/2));
    
    // Calculate percentage for background-position
    const percentageX = ((x - lensWidth/2) / (width - lensWidth)) * 100;
    const percentageY = ((y - lensHeight/2) / (height - lensHeight)) * 100;

    setZoomPos({ 
        x: x - lensWidth/2, 
        y: y - lensHeight/2,
        percentageX,
        percentageY
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
      {/* Gallery Section */}
      <div className="space-y-4">
        <div className="relative group/zoom">
          <div 
            className="relative aspect-square overflow-hidden rounded-xl border bg-white cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setShowZoom(true)}
            onMouseLeave={() => setShowZoom(false)}
          >
            {product.images && product.images.length > 0 && selectedImage < product.images.length ? (
              <>
                <img 
                  src={product.images[selectedImage]} 
                  alt={product.name} 
                  className="h-full w-full object-contain p-4"
                />
                
                {/* Lens - Daraz Style Overlay */}
                {showZoom && (
                  <div 
                    className="absolute border border-primary/30 bg-primary/10 shadow-inner pointer-events-none hidden lg:block"
                    style={{
                      width: '150px',
                      height: '150px',
                      left: `${zoomPos.x}px`,
                      top: `${zoomPos.y}px`,
                    }}
                  />
                )}
              </>
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

          {/* External Zoom Preview Window - Daraz Style */}
          {/* Placed outside the overflow-hidden container so it can overlay the right column */}
          {showZoom && product.images && product.images.length > 0 && product.images[selectedImage] && (
            <div 
              className="absolute left-full ml-10 top-0 w-[120%] h-full border-2 border-primary/20 rounded-2xl bg-white shadow-2xl z-50 pointer-events-none overflow-hidden hidden lg:block animate-in fade-in zoom-in-95 duration-200"
            >
              <div 
                className="w-full h-full bg-no-repeat"
                style={{
                  backgroundImage: `url(${product.images[selectedImage]})`,
                  backgroundSize: '300%', // Zoom level
                  backgroundPosition: `${zoomPos.percentageX}% ${zoomPos.percentageY}%`,
                }}
              />
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="bg-white/80 backdrop-blur-sm shadow-sm font-bold uppercase tracking-tight text-[8px]">
                    Micro-Zoom 3.0x
                </Badge>
              </div>
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
              ৳{Math.round(displaySalePrice || displayPrice)}
            </span>
            {displaySalePrice && displaySalePrice !== displayPrice && (
              <span className="text-xl text-muted-foreground line-through font-medium">
                ৳{Math.round(displayPrice)}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className={`text-xs font-bold ${displayStock > 0 ? 'text-green-600' : 'text-destructive'}`}>
                {displayStock > 0 ? `In stock (${displayStock} units available)` : 'Out of stock'}
            </p>
            {displaySku && (
                <span className="text-xs text-muted-foreground">| SKU: {displaySku}</span>
            )}
          </div>
        </div>

        <p className="text-muted-foreground leading-relaxed">
          {product.description}
        </p>

        <Separator />

        {/* Selection Options */}
        <div className="space-y-6">
          {/* Colors Selection */}
          {uniqueColors.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-wider">Color:</span>
                <span className="text-sm text-primary font-medium">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {uniqueColors.map((colorName, i) => {
                  // Find first variant for this color to get thumbnail
                  const colorVariant = product.variants?.find((v: any) => v.color === colorName);
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedColor(colorName)}
                      className={`relative flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 ${
                        selectedColor === colorName 
                          ? 'border-primary bg-primary/5 ring-4 ring-primary/10' 
                          : 'border-muted hover:border-primary/30'
                      }`}
                    >
                      {colorVariant?.image && (
                        <div className="h-8 w-8 rounded-full overflow-hidden border bg-background">
                          <img src={colorVariant.image} alt="" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <span className="text-xs font-bold">{colorName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizes Selection */}
          {uniqueSizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-wider">Size:</span>
                <span className="text-sm text-primary font-medium">{selectedSize || 'Select a size'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueSizes.map((sizeName, i) => {
                  const isAvailable = availableSizes.includes(sizeName);
                  return (
                    <button
                      key={i}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSize(sizeName)}
                      className={`min-w-[48px] h-12 flex items-center justify-center rounded-xl border-2 font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale disabled:scale-100 ${
                        selectedSize === sizeName 
                          ? 'border-primary bg-primary/5 ring-4 ring-primary/10 text-primary' 
                          : 'border-muted hover:border-primary/30 text-muted-foreground'
                      }`}
                    >
                      {sizeName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Others Selection */}
          {uniqueOthers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold uppercase tracking-wider">Option:</span>
                <span className="text-sm text-primary font-medium">{selectedOthers || 'Select an option'}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {uniqueOthers.map((optName, i) => {
                  const isAvailable = availableOthers.includes(optName);
                  return (
                    <button
                      key={i}
                      disabled={!isAvailable}
                      onClick={() => setSelectedOthers(optName)}
                      className={`px-4 h-12 flex items-center justify-center rounded-xl border-2 font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale disabled:scale-100 ${
                        selectedOthers === optName 
                          ? 'border-primary bg-primary/5 ring-4 ring-primary/10 text-primary' 
                          : 'border-muted hover:border-primary/30 text-muted-foreground'
                      }`}
                    >
                      {optName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Regular Attributes */}
        {product.attributes && product.attributes.length > 0 && (
            <div className="space-y-3 pt-2">
                {product.attributes?.map((attr: any, i: number) => (
                    <div key={i} className="flex items-center gap-4">
                        <span className="text-xs font-bold min-w-[80px] uppercase tracking-wider text-muted-foreground">{attr.key}:</span>
                        <span className="text-xs font-medium">{attr.value}</span>
                    </div>
                ))}
            </div>
        )}

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
                  onClick={() => setQuantity(Math.min(displayStock || 0, quantity + 1))}
                  disabled={quantity >= (displayStock || 0)}
              >
                  <Plus className="h-4 w-4" />
              </Button>
          </div>
          <Button 
              size="lg" 
              className="flex-1 h-12 rounded-full font-bold uppercase tracking-wider transition-all hover:scale-[1.02] shadow-xl shadow-primary/20"
              onClick={handleAddToCart}
              disabled={(displayStock || 0) === 0}
          >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
          </Button>
          <Button 
            size="icon" 
            variant="outline" 
            className="h-12 w-12 rounded-full transition-all hover:scale-110 active:scale-95"
            onClick={handleFavorite}
            aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
              <Heart className={`h-5 w-5 transition-colors ${isInWishlist ? 'fill-destructive text-destructive' : 'text-muted-foreground'}`} />
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
      
      {/* Reviews Section */}
      <div className="col-span-full mt-24 space-y-10 border-t pt-20">
        <ReviewsSection productId={product._id} />
      </div>
    </div>
  );
}
