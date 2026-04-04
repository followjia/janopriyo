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
import { 
  RadioGroup, 
  RadioGroupItem 
} from '@/components/ui/radio-group';

const productSchema = z.object({
  name: z.string().min(3, 'Name is required'),
  slug: z.string().min(3, 'Slug is required'),
  description: z.string().min(10, 'Description is required'),
  price: z.coerce.number().positive('Price must be greater than zero'),
  salePrice: z.coerce.number().min(0).optional(),
  sku: z.string().min(3, 'SKU is required'),
  stock: z.coerce.number().int().min(0, 'Stock must be at least 0'),
  categories: z.array(z.string()),
  images: z.array(z.string()).min(1, 'Upload at least one image'),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  attributes: z.array(z.object({
    key: z.string(),
    value: z.string()
  })),
  deliveryCharge: z.object({
    type: z.enum(['all_over_country', 'location_based']),
    amount: z.coerce.number().min(0),
    insideDhaka: z.coerce.number().min(0),
    outsideDhaka: z.coerce.number().min(0)
  })
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
    attributes: initialData?.attributes || [],
    deliveryCharge: initialData?.deliveryCharge || {
      type: 'all_over_country',
      amount: 100,
      insideDhaka: 60,
      outsideDhaka: 120
    }
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
    form.setValue('images', [...currentImages, url], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const removeImage = (url: string) => {
    const currentImages = form.getValues('images');
    form.setValue('images', currentImages.filter(i => i !== url), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const toggleCategory = (catId: string) => {
    const currentCats = form.getValues('categories');
    const category = categories.find(c => c._id === catId);
    if (!category) return;

    if (currentCats.includes(catId)) {
      // Removing category
      let newCats = currentCats.filter(id => id !== catId);
      
      // If it's a main category (no parent), also remove its subcategories
      if (!category.parentCategory) {
        newCats = newCats.filter(id => {
          const sub = categories.find(c => c._id === id);
          const parentId = sub?.parentCategory?._id || sub?.parentCategory;
          return parentId !== catId;
        });
      }

      form.setValue('categories', newCats, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      // Adding category
      form.setValue('categories', [...currentCats, catId], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const selectedCats = form.watch('categories');
  const mainCategories = categories.filter((cat) => !cat.parentCategory);
  const selectedMainCategoryIds = mainCategories
    .filter(mc => selectedCats.includes(mc._id))
    .map(mc => mc._id);

  // Validation Check: ensure at least one main category is selected
  const hasMainCategory = selectedMainCategoryIds.length > 0;

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
                  <Label>Gallery Images</Label>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {form.watch('images').map((url, index) => (
                    <div key={`${url}-${index}`} className="relative aspect-square rounded-md overflow-hidden border bg-muted">
                      <Image 
                        src={url} 
                        alt={`Product image ${index + 1}`} 
                        fill
                        className="object-cover" 
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 z-10"
                        aria-label={`Remove product image ${index + 1}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <ImageUpload onUpload={addImage} />
                </div>
                {form.formState.errors.images?.message && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    {form.formState.errors.images.message}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Attributes (Size, Color, etc.)</Label>
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
                <Label className="text-base font-bold">Delivery Charges</Label>
                <FormField
                  control={form.control}
                  name="deliveryCharge.type"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-2"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="all_over_country" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              All over the country
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="location_based" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Location Based (Dhaka/Outside)
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {form.watch('deliveryCharge.type') === 'all_over_country' ? (
                  <FormField
                    control={form.control}
                    name="deliveryCharge.amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Regular Delivery Charge (TK)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="deliveryCharge.insideDhaka"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inside Dhaka (TK)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deliveryCharge.outsideDhaka"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Outside Dhaka (TK)</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-bold">Product Category</Label>
                  <span className="text-[10px] text-destructive uppercase font-bold">Required</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {mainCategories.map((mainCat) => (
                    <Badge
                      key={mainCat._id}
                      variant={selectedCats.includes(mainCat._id) ? 'default' : 'outline'}
                      className="cursor-pointer py-1.5 px-4 text-sm"
                      onClick={() => toggleCategory(mainCat._id)}
                    >
                      {mainCat.name}
                    </Badge>
                  ))}
                </div>
                {!hasMainCategory && form.formState.isSubmitted && (
                  <p className="text-[0.8rem] font-medium text-destructive">
                    Select at least one product category
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-bold">Sub Category</Label>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">Optional</span>
                </div>
                <div className="space-y-4 pt-2">
                  {selectedMainCategoryIds.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {categories
                        .filter((sub) => {
                          const parentId = sub.parentCategory?._id || sub.parentCategory;
                          return selectedMainCategoryIds.includes(parentId);
                        })
                        .map((subCat) => (
                          <Badge
                            key={subCat._id}
                            variant={selectedCats.includes(subCat._id) ? 'default' : 'outline'}
                            className="cursor-pointer py-1 px-3 text-xs"
                            onClick={() => toggleCategory(subCat._id)}
                          >
                            {subCat.name}
                          </Badge>
                        ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Select a product category to see available subcategories
                    </p>
                  )}
                </div>
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
