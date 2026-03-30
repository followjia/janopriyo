'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Trash, 
  Loader2, 
  ArrowLeft,
  X,
  PlusCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ui/image-upload';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

const productSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  slug: z.string().min(3, 'Slug is required'),
  description: z.string().min(10, 'Description is required'),
  price: z.coerce.number().positive('Price must be greater than zero'),
  salePrice: z.coerce.number().min(0).optional(),
  sku: z.string().min(3, 'SKU is required'),
  stock: z.coerce.number().int().min(0, 'Stock must be at least 0'),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  images: z.array(z.string()).min(1, 'Upload at least one image'),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  attributes: z.array(z.object({
    key: z.string(),
    value: z.string()
  }))
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: any;
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const defaultValues: ProductFormValues = {
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    salePrice: initialData?.salePrice || undefined,
    sku: initialData?.sku || '',
    stock: initialData?.stock || 0,
    categories: initialData?.categories?.map((c: any) => typeof c === 'object' ? c._id : c) || [],
    images: initialData?.images || [],
    isPublished: initialData?.isPublished ?? true,
    isFeatured: initialData?.isFeatured ?? false,
    attributes: initialData?.attributes || []
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as unknown as Resolver<ProductFormValues>,
    defaultValues
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "attributes"
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
        toast.error('Failed to load categories');
      }
    }
    fetchCategories();
  }, []);

  const nameValue = form.watch('name');
  useEffect(() => {
    if (nameValue && !initialData) {
      const slug = nameValue
        .toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
      form.setValue('slug', slug);
    }
  }, [nameValue, form, initialData]);

  const onSubmit = async (values: ProductFormValues) => {
    setLoading(true);
    try {
      const url = initialData ? `/api/products/${initialData._id}` : '/api/products';
      const method = initialData ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success(`Product ${initialData ? 'updated' : 'created'} successfully`);
        router.push('/admin/products');
        router.refresh();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const addImage = (url: string) => {
    const currentImages = form.getValues('images');
    form.setValue('images', [...currentImages, url]);
  };

  const removeImage = (url: string) => {
    const currentImages = form.getValues('images');
    form.setValue('images', currentImages.filter(i => i !== url));
  };

  const toggleCategory = (catId: string) => {
    const currentCats = form.getValues('categories');
    if (currentCats.includes(catId)) {
      form.setValue('categories', currentCats.filter(id => id !== catId));
    } else {
      form.setValue('categories', [...currentCats, catId]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">
              {initialData ? 'Edit' : 'Add'} Product
            </h1>
          </div>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Product
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="product-slug" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SKU</FormLabel>
                        <FormControl>
                          <Input placeholder="STK-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                            rows={6} 
                            placeholder="Write product description here..." 
                            {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Gallery Images</FormLabel>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {form.watch('images').map((url, index) => (
                    <div key={`${url}-${index}`} className="relative aspect-square rounded-md overflow-hidden border bg-muted">
                      <Image 
                        src={url} 
                        alt="product" 
                        fill
                        className="object-cover" 
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 z-10"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <ImageUpload onUpload={addImage} />
                </div>
                <FormMessage>{form.formState.errors.images?.message}</FormMessage>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Attributes (Size, Color, etc.)</FormLabel>
                  <Button type="button" variant="outline" size="sm" onClick={() => append({ key: '', value: '' })}>
                    <Plus className="mr-2 h-4 w-4" /> Add Attribute
                  </Button>
                </div>
                <div className="space-y-4">
                  {fields.map((item, index) => (
                    <div key={item.id} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Label>Label</Label>
                        <Input {...form.register(`attributes.${index}.key` as const)} placeholder="e.g. Color" />
                      </div>
                      <div className="flex-1">
                        <Label>Value</Label>
                        <Input {...form.register(`attributes.${index}.value` as const)} placeholder="e.g. Red" />
                      </div>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive" 
                        onClick={() => remove(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="salePrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sale Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <FormLabel>Categories</FormLabel>
                <div className="flex flex-wrap gap-2 pt-2">
                  {categories.map((cat) => (
                    <Badge
                      key={cat._id}
                      variant={form.watch('categories').includes(cat._id) ? 'default' : 'outline'}
                      className="cursor-pointer py-1 px-3"
                      onClick={() => toggleCategory(cat._id)}
                    >
                      {cat.name}
                    </Badge>
                  ))}
                </div>
                <FormMessage>{form.formState.errors.categories?.message}</FormMessage>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                    <Label htmlFor="featured">Featured Product</Label>
                    <input 
                        type="checkbox" 
                        id="featured"
                        {...form.register('isFeatured')} 
                        className="h-4 w-4" 
                    />
                </div>
                <div className="flex items-center justify-between">
                    <Label htmlFor="published">Published</Label>
                    <input 
                        type="checkbox" 
                        id="published"
                        {...form.register('isPublished')} 
                        className="h-4 w-4" 
                    />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
