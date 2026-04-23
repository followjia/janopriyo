'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ui/image-upload';

const settingsSchema = z.object({
  brandName: z.string().min(2, 'Brand Name is required'),
  contact: z.object({
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Invalid phone number'),
    address: z.string().min(5, 'Address is required'),
  }),
  socialLinks: z.object({
    facebook: z.string().nullish().transform(v => v ?? ''),
    twitter: z.string().nullish().transform(v => v ?? ''),
    instagram: z.string().nullish().transform(v => v ?? ''),
    youtube: z.string().nullish().transform(v => v ?? ''),
    linkedin: z.string().nullish().transform(v => v ?? ''),
    tiktok: z.string().nullish().transform(v => v ?? ''),
    whatsapp: z.string().nullish().transform(v => v ?? ''),
  }),
  marqueeText: z.string().nullish().transform(val => val ?? ''),
  metaTitle: z.string().nullish().transform(val => val ?? ''),
  metaDescription: z.string().nullish().transform(val => val ?? ''),
  courierConfig: z.object({
    activeProvider: z.enum(['steadfast', 'pathao', 'redx', 'none']).default('none'),
    steadfast: z.object({
      apiKey: z.string().nullish().or(z.literal('')).transform(v => v ?? ''),
      secretKey: z.string().nullish().or(z.literal('')).transform(v => v ?? ''),
    }).optional().nullable(),
    pathao: z.object({
      clientId: z.string().nullish().or(z.literal('')).transform(v => v ?? ''),
      clientSecret: z.string().nullish().or(z.literal('')).transform(v => v ?? ''),
      storeId: z.string().nullish().or(z.literal('')).transform(v => v ?? ''),
    }).optional().nullable(),
    redx: z.object({
      apiKey: z.string().nullish().or(z.literal('')).transform(v => v ?? ''),
    }).optional().nullable(),
  }).optional(),
  subscriptionConfig: z.object({
    activationThreshold: z.number().min(0, 'Threshold cannot be negative'),
    rewardPercentage: z.number().min(0, 'Percentage cannot be negative').max(100, 'Cannot exceed 100%'),
  }).optional(),
  freeDeliveryThreshold: z.number().min(0, 'Threshold cannot be negative').optional(),
  deliveryChargeInsideDhaka: z.number().min(0, 'Charge cannot be negative').optional(),
  deliveryChargeOutsideDhaka: z.number().min(0, 'Charge cannot be negative').optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      brandName: '',
      contact: { email: '', phone: '', address: '' },
      socialLinks: {
        facebook: '',
        twitter: '',
        instagram: '',
        youtube: '',
        linkedin: '',
        tiktok: '',
        whatsapp: ''
      },
      marqueeText: '',
      metaTitle: '',
      metaDescription: '',
      courierConfig: {
        activeProvider: 'none',
        steadfast: { apiKey: '', secretKey: '' },
        pathao: { clientId: '', clientSecret: '', storeId: '' },
        redx: { apiKey: '' },
      },
      subscriptionConfig: {
        activationThreshold: 5000,
        rewardPercentage: 5,
      },
      freeDeliveryThreshold: 0,
      deliveryChargeInsideDhaka: 60,
      deliveryChargeOutsideDhaka: 120,
    },
  });

  useEffect(() => {
    const controller = new AbortController();

    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings', { signal: controller.signal });
        if (res.ok) {
          const data = await res.json();

          const result = settingsSchema.safeParse(data);
          if (result.success) {
            if (!controller.signal.aborted) {
              const sanitizedData: SettingsFormValues = {
                brandName: result.data.brandName || '',
                contact: {
                  email: result.data.contact?.email || '',
                  phone: result.data.contact?.phone || '',
                  address: result.data.contact?.address || '',
                },
                marqueeText: result.data.marqueeText || '',
                socialLinks: {
                  facebook: result.data.socialLinks?.facebook || '',
                  twitter: result.data.socialLinks?.twitter || '',
                  instagram: result.data.socialLinks?.instagram || '',
                  youtube: result.data.socialLinks?.youtube || '',
                  linkedin: result.data.socialLinks?.linkedin || '',
                  tiktok: result.data.socialLinks?.tiktok || '',
                  whatsapp: result.data.socialLinks?.whatsapp || '',
                },
                metaTitle: result.data.metaTitle || '',
                metaDescription: result.data.metaDescription || '',
                freeDeliveryThreshold: result.data.freeDeliveryThreshold ?? 0,
                deliveryChargeInsideDhaka: result.data.deliveryChargeInsideDhaka ?? 60,
                deliveryChargeOutsideDhaka: result.data.deliveryChargeOutsideDhaka ?? 120,
                subscriptionConfig: {
                  activationThreshold: result.data.subscriptionConfig?.activationThreshold ?? 5000,
                  rewardPercentage: result.data.subscriptionConfig?.rewardPercentage ?? 5,
                },
                courierConfig: {
                  activeProvider: result.data.courierConfig?.activeProvider || 'none',
                  steadfast: {
                    apiKey: result.data.courierConfig?.steadfast?.apiKey || '',
                    secretKey: result.data.courierConfig?.steadfast?.secretKey || '',
                  },
                  pathao: {
                    clientId: result.data.courierConfig?.pathao?.clientId || '',
                    clientSecret: result.data.courierConfig?.pathao?.clientSecret || '',
                    storeId: result.data.courierConfig?.pathao?.storeId || '',
                  },
                  redx: {
                    apiKey: result.data.courierConfig?.redx?.apiKey || '',
                  },
                },
              };
              form.reset(sanitizedData);
            }
          } else {
            console.error('Settings validation failed:', result.error);
            toast.error('Received invalid settings from server');
          }
        } else {
          if (!controller.signal.aborted) {
            toast.error(`Failed to load settings: ${res.status} ${res.statusText}`);
          }
        }
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        if (!controller.signal.aborted) {
          toast.error('Failed to load settings');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchSettings();
    return () => controller.abort();
  }, [form]);

  const onSubmit = async (values: SettingsFormValues) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success('Settings updated successfully');
      } else {
        toast.error('Failed to update settings');
      }
    } catch (error) {
      toast.error('Error updating settings');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Global Settings</h1>
        <Button type="submit" form="settings-form" disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>

      <Form {...form}>
        <form id="settings-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="courier">Courier</TabsTrigger>
              <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Branding</CardTitle>
                  <CardDescription>Manage your store's identity and visibility.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="brandName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Janopriyo Shop" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="marqueeText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marquee/Ticker Text</FormLabel>
                        <FormControl>
                          <Input placeholder="Announcements, offers, promotions..." {...field} />
                        </FormControl>
                        <FormDescription>This text will display as a scrolling marquee at the top of the site.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="metaTitle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Global Meta Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Janopriyo Shop | Best Ecommerce in BD" {...field} />
                          </FormControl>
                          <FormDescription>Used as the primary browser title for the home page.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="metaDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Global Meta Description</FormLabel>
                          <FormControl>
                            <Input placeholder="Shop the best products at Janopriyo..." {...field} />
                          </FormControl>
                          <FormDescription>Used for search engine snippets and social sharing.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Update how customers can reach you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contact.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input placeholder="support@shop.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="+880 1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact.address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Building name, Street, City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Links</CardTitle>
                  <CardDescription>Add links to your social media profiles.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="socialLinks.facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://facebook.com/your-page" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="socialLinks.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>X (Twitter) URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://twitter.com/your-handle" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="socialLinks.instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://instagram.com/your-handle" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="socialLinks.youtube"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://youtube.com/@your-channel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="socialLinks.linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/in/your-profile" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="socialLinks.tiktok"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TikTok URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://tiktok.com/@your-handle" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="socialLinks.whatsapp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://wa.me/your-number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="courier" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Courier & Shipping Integration</CardTitle>
                  <CardDescription>Configure your preferred courier service for automated parcel booking.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="courierConfig.activeProvider"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Active Courier Provider</FormLabel>
                        <div className="flex items-center gap-4">
                          <select
                            {...field}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="none">None (Manual Handling)</option>
                            <option value="steadfast">Steadfast Courier</option>
                            <option value="pathao">Pathao Courier</option>
                            <option value="redx">RedX</option>
                          </select>
                        </div>
                        <FormDescription>Select which courier service to use for automated booking by default.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                    <h3 className="font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      SteadFast Configuration
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="courierConfig.steadfast.apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Key</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter Steadfast API Key" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="courierConfig.steadfast.secretKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Secret Key</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Enter Steadfast Secret Key" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                    <h3 className="font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Pathao Courier
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="courierConfig.pathao.clientId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client ID</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Pathao Client ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="courierConfig.pathao.clientSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client Secret</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Pathao Client Secret" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="courierConfig.pathao.storeId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Store ID</FormLabel>
                            <FormControl>
                              <Input placeholder="Pathao Store ID" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border rounded-lg p-4 bg-muted/20">
                    <h3 className="font-bold flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      RedX Configuration
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="courierConfig.redx.apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>RedX API Key</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="RedX API Key" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                      <Truck className="h-5 w-5 text-primary" />
                      Delivery Rules
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="freeDeliveryThreshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Free Delivery Threshold (TK)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="2000"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormDescription>Minimum order total to offer free delivery. Set to 0 to disable.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="deliveryChargeInsideDhaka"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inside Dhaka Charge (TK)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="60"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="deliveryChargeOutsideDhaka"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Outside Dhaka Charge (TK)</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="120"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/50 border-t py-4">
                  <p className="text-xs text-muted-foreground italic">
                    * Note: Ensure you have obtained production API credentials from your courier merchant portal.
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="loyalty" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Loyalty & Rewards System</CardTitle>
                  <CardDescription>Configure how customers activate their lifetime rewards and the percentage they earn.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="subscriptionConfig.activationThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Activation Threshold (TK)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="5000"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>Minimum single order amount to activate lifetime rewards for a user.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subscriptionConfig.rewardPercentage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reward Percentage (%)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="5"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>Percentage of purchase total awarded as tokens to active users.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="rounded-lg border p-4 bg-primary/5">
                    <h4 className="text-sm font-bold mb-2">How it works:</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                      <li>All registered users are enrolled in the loyalty program automatically.</li>
                      <li>Users become <strong>Active</strong> after a single purchase ≥ {form.watch('subscriptionConfig.activationThreshold')} TK.</li>
                      <li>Active users earn <strong>{form.watch('subscriptionConfig.rewardPercentage')}%</strong> of every purchase as wallet tokens.</li>
                      <li>Tokens can be used for discounts on any future purchase.</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
