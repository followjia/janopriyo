'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductCard } from '@/components/storefront/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
    Filter, 
    Search, 
    X, 
    ChevronDown, 
    Loader2, 
    LayoutGrid, 
    LayoutList 
} from 'lucide-react';
import { 
    Sheet, 
    SheetContent, 
    SheetTrigger, 
    SheetHeader, 
    SheetTitle 
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

// Component for the SearchParams usage to avoid deopting the whole page from static optimization
function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialSearch = searchParams.get('q');

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategory ? [initialCategory] : []
  );
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState(initialSearch || '');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch categories for sidebar
        const catRes = await fetch('/api/categories');
        if (catRes.ok) {
          const catData = await catRes.json();
          if (Array.isArray(catData)) {
            setCategories(catData.filter((c: any) => c.isActive));
          }
        }

        // Fetch products
        const prodRes = await fetch('/api/products');
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (Array.isArray(prodData)) {
            setProducts(prodData.filter((p: any) => p.isPublished));
          }
        }
      } catch (error) {
        console.error('Failed to load shop data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.description?.toLowerCase() ?? '').includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategories.length === 0 || 
                             (p.categories ?? []).some((c: any) => selectedCategories.includes(c.slug) || selectedCategories.includes(c._id));
      const price = p.salePrice || p.price;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];

      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      const priceA = a.salePrice || a.price;
      const priceB = b.salePrice || b.price;
      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const toggleCategory = (slug: string) => {
    setSelectedCategories(prev => 
        prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 5000]);
    setSearchTerm('');
  };

  const Sidebar = () => (
    <div className="space-y-8">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4">Categories</h3>
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat._id} className="flex items-center space-x-2">
              <Checkbox 
                id={cat._id} 
                checked={selectedCategories.includes(cat.slug)}
                onCheckedChange={() => toggleCategory(cat.slug)}
              />
              <Label 
                htmlFor={cat._id} 
                className="text-sm font-medium leading-none cursor-pointer hover:text-primary transition-colors"
              >
                {cat.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-6">Price Range</h3>
        <Slider 
          value={priceRange} 
          max={5000} 
          step={50}
          onValueChange={(val) => {
            if (Array.isArray(val)) setPriceRange([...val]);
          }}
          className="mb-4"
        />
        <div className="flex items-center justify-between text-sm font-medium">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}+</span>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Reset All Filters
      </Button>
    </div>
  );

  return (
    <div className="container px-4 md:px-6 py-10">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 shrink-0 md:block">
          <Sidebar />
        </aside>

        <div className="flex-1 space-y-6">
          {/* Top Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-6">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="md:hidden flex items-center gap-1">
                    <Filter className="h-4 w-4" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                    <SheetHeader className="mb-6">
                        <SheetTitle>Filter Products</SheetTitle>
                    </SheetHeader>
                   <Sidebar />
                </SheetContent>
              </Sheet>

              <Select value={sortBy} onValueChange={(val) => {
                if (val) setSortBy(val);
              }}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <div className="hidden items-center border rounded-md p-1 sm:flex">
                <Button 
                    variant={view === 'grid' ? 'secondary' : 'ghost'} 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setView('grid')}
                >
                    <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button 
                    variant={view === 'list' ? 'secondary' : 'ghost'} 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setView('list')}
                >
                    <LayoutList className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters Bar */}
          {(selectedCategories.length > 0 || searchTerm || priceRange[0] > 0 || priceRange[1] < 5000) && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-bold uppercase text-muted-foreground mr-2">Filtered By:</span>
              {selectedCategories.map(cat => (
                <Badge key={cat} variant="secondary" className="gap-1 rounded-full px-3 py-1">
                  {categories.find(c => c.slug === cat)?.name || cat} <X className="h-3 w-3 cursor-pointer" onClick={() => toggleCategory(cat)} />
                </Badge>
              ))}
              {searchTerm && (
                <Badge variant="secondary" className="gap-1 rounded-full px-3 py-1">
                  Search: {searchTerm} <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm('')} />
                </Badge>
              )}
              {(priceRange[0] !== 0 || priceRange[1] !== 5000) && (
                <Badge variant="secondary" className="gap-1 rounded-full px-3 py-1">
                   Price: ${priceRange[0]} - ${priceRange[1]}
                </Badge>
              )}
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={clearFilters}>
                Clear All
              </Button>
            </div>
          )}

          {/* Product Grid */}
          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse text-sm">Getting your shop ready...</p>
             </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="rounded-full bg-muted p-6">
                    <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-bold">No products found</h2>
                <p className="text-muted-foreground max-w-xs">
                    Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <Button variant="outline" onClick={clearFilters}>Reset All Filters</Button>
            </div>
          ) : (
            <div className={`grid gap-6 ${view === 'grid' ? 'grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="container py-20 flex justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}
