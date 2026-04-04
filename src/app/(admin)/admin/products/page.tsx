'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Edit, Trash, Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const fetchProducts = async (signal?: AbortSignal) => {
    try {
      const response = await fetch('/api/products', { signal });
      if (!response.ok) {
        toast.error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        return;
      }
      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Product deleted successfully');
        fetchProducts();
      } else {
        toast.error('Failed to delete product');
      }
    } catch (error) {
      toast.error('Error deleting product');
    }
  };

  const filteredProducts = products.filter(p => {
    const searchLower = (search ?? '').toLowerCase();
    const nameLower = (p.name ?? '').toLowerCase();
    const skuLower = (p.sku ?? '').toLowerCase();
    return nameLower.includes(searchLower) || skuLower.includes(searchLower);
  });

  return (
    <div className="flex flex-col gap-4 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-background overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <TableRow key={product._id}>
                  <TableCell>
                    <div className="h-12 w-12 overflow-hidden rounded-md border bg-muted">
                      {product.images?.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="h-full w-full object-cover" 
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Plus className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium max-w-[250px] truncate">
                    {product.name}
                  </TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className={product.salePrice ? 'text-xs line-through text-muted-foreground' : ''}>
                        ${product.price ? product.price.toFixed(2) : '0.00'}
                      </span>
                      {product.salePrice && (
                        <span className="font-semibold text-primary">
                          ${product.salePrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={(product.stock ?? 0) <= 5 ? 'text-destructive font-semibold' : ''}>
                      {product.stock ?? 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={product.isPublished ? 'default' : 'secondary'}>
                      {product.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => router.push(`/admin/products/${product._id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive" 
                        onClick={() => handleDelete(product._id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
