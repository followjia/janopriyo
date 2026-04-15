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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ui/image-upload';

const settingsSchema = z.object({
  brandName: z.string().min(2, 'Brand Name is required'),
  logo: z.string().min(1, 'Logo is required'),
  favicon: z.string().optional(),
  contact: z.object({
    email: z.string().email('Invalid email'),
    phone: z.string().min(10, 'Invalid phone number'),
    address: z.string().min(5, 'Address is required'),
  }),
  socialLinks: z.object({
    facebook: z.string().url().optional().or(z.literal('')),
    twitter: z.string().url().optional().or(z.literal('')),
    instagram: z.string().url().optional().or(z.literal('')),
    youtube: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    tiktok: z.string().url().optional().or(z.literal('')),
    whatsapp: z.string().url().optional().or(z.literal('')),
  }),
  marqueeText: z.string().optional(),
  googleTagManagerId: z.string().optional(),
  searchConsoleMeta: z.string().optional(),
  metaPixelId: z.string().optional(),
  courierConfig: z.object({
    activeProvider: z.enum(['steadfast', 'pathao', 'redx', 'none']).default('none'),
    steadfast: z.object({
      apiKey: z.string().optional().or(z.literal('')),
      secretKey: z.string().optional().or(z.literal('')),
    }).optional(),
    pathao: z.object({
      clientId: z.string().optional().or(z.literal('')),
      clientSecret: z.string().optional().or(z.literal('')),
      storeId: z.string().optional().or(z.literal('')),
    }).optional(),
    redx: z.object({
      apiKey: z.string().optional().or(z.literal('')),
    }).optional(),
  }).optional(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema) as any,
    defaultValues: {
      brandName: '',
      logo: '',
      favicon: '',
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
      googleTagManagerId: '',
      searchConsoleMeta: '',
      metaPixelId: '',
      courierConfig: {
        activeProvider: 'none',
        steadfast: { apiKey: '', secretKey: '' },
        pathao: { clientId: '', clientSecret: '', storeId: '' },
        redx: { apiKey: '' },
      },
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
              // Merge with default values to ensure no fields (including top-level ones) are undefined
              const sanitizedData = {
                ...form.getValues(),
                ...result.data,
                socialLinks: {
                  ...form.getValues().socialLinks,
                  ...(result.data.socialLinks || {})
                },
                courierConfig: {
                  ...form.getValues().courierConfig,
                  ...(result.data.courierConfig || {}),
                  steadfast: {
                    ...form.getValues().courierConfig?.steadfast,
                    ...(result.data.courierConfig?.steadfast || {})
                  },
                  pathao: {
                    ...form.getValues().courierConfig?.pathao,
                    ...(result.data.courierConfig?.pathao || {})
                  },
                  redx: {
                    ...form.getValues().courierConfig?.redx,
                    ...(result.data.courierConfig?.redx || {})
                  }
                }
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
            <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="courier">Courier</TabsTrigger>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo</FormLabel>
                          <FormControl>
                            <ImageUpload 
                                value={field.value} 
                                onUpload={(url) => field.onChange(url)} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="favicon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Favicon</FormLabel>
                          <FormControl>
                            <ImageUpload 
                                value={field.value} 
                                onUpload={(url) => field.onChange(url)} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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

                  <div className="space-y-4 border rounded-lg p-4 bg-muted/20 opacity-60">
                    <h3 className="font-bold">Pathao Courier (Coming Soon)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input disabled placeholder="Pathao Client ID" />
                        <Input disabled placeholder="Pathao Client Secret" />
                        <Input disabled placeholder="Pathao Store ID" />
                    </div>
                  </div>

                  <div className="space-y-4 border rounded-lg p-4 bg-muted/20 opacity-60">
                    <h3 className="font-bold">RedX (Coming Soon)</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <Input disabled placeholder="RedX API Key" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 py-4">
                    <p className="text-xs text-muted-foreground italic">
                        * Note: Ensure you have obtained production API credentials from your courier merchant portal.
                    </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
