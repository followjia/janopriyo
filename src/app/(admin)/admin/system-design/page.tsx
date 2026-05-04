'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Layout, 
  Palette, 
  Monitor, 
  Save, 
  ShieldCheck,
  ChevronRight,
  Eye,
  Globe,
  CreditCard,
  BarChart3,
  Truck,
  Settings2,
  Code
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";



const TEMPLATE_OPTIONS = ['v1', 'v2', 'v3', 'v4', 'v5'];

export default function SuperConfigPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to load settings: ${res.status}`);
      }
      const data = await res.json();
      setSettings(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!settings) {
      toast.error('No settings data available to save');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success('SaaS Infrastructure Configured Successfully!');
        router.refresh();
      } else {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Update failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateTemplate = (key: string, value: string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      uiTemplates: {
        ...(settings.uiTemplates || {}),
        [key]: value
      }
    });
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
    </div>
  );

  const ui = settings?.uiTemplates || {};

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
            <ShieldCheck className="h-4 w-4" /> Global Infrastructure Control
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Tenant Deep Config</h1>
          <p className="text-muted-foreground">Manage keys, tracking, and logistics for this specific domain.</p>
        </div>
        <Button 
          onClick={handleUpdate} 
          disabled={saving || !settings}
          className="h-12 px-8 rounded-xl font-bold gap-2 shadow-lg shadow-primary/20"
        >
          {saving ? 'Applying...' : <><Save className="h-5 w-5" /> Save SaaS Config</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* 1. Tenant Identification */}
        <Card className="lg:col-span-3 border-2 border-primary/20 shadow-none overflow-hidden rounded-3xl">
           <CardHeader className="bg-primary/5 border-b">
              <CardTitle className="flex items-center gap-2">
                 <Globe className="h-5 w-5 text-primary" /> Core Identity
              </CardTitle>
           </CardHeader>
           <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="space-y-2">
                <Label htmlFor="store-domain" className="font-bold">Store Domain</Label>
                <input 
                  id="store-domain"
                  value={settings?.domain || ''} 
                  onChange={(e) => setSettings({...settings, domain: e.target.value})}
                  className="w-full h-12 rounded-xl border px-4 focus:ring-2 focus:ring-primary outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenant-store-id" className="font-bold">Tenant Store ID</Label>
                <input 
                  id="tenant-store-id"
                  value={settings?.storeId || ''} 
                  onChange={(e) => setSettings({...settings, storeId: e.target.value})}
                  className="w-full h-12 rounded-xl border px-4 focus:ring-2 focus:ring-primary outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gtm-id" className="font-bold">GTM ID (Tag Manager)</Label>
                <input 
                  id="gtm-id"
                  value={settings?.googleTagManagerId || ''} 
                  onChange={(e) => setSettings({...settings, googleTagManagerId: e.target.value})}
                  placeholder="GTM-XXXXXXX"
                  className="w-full h-12 rounded-xl border px-4 focus:ring-2 focus:ring-primary outline-none text-sm"
                />
              </div>
           </CardContent>
        </Card>

        {/* 2. SEO & Tracking */}
        <Card className="lg:col-span-1 border-2 shadow-none overflow-hidden rounded-3xl">
           <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center gap-2">
                 <BarChart3 className="h-5 w-5 text-primary" /> Advanced Tracking
              </CardTitle>
           </CardHeader>
           <CardContent className="p-6 space-y-6">
               <div className="space-y-2">
                <Label htmlFor="meta-pixel-id" className="font-bold text-xs">Meta Pixel ID</Label>
                <input id="meta-pixel-id" value={settings?.metaPixelId || ''} onChange={(e) => setSettings({...settings, metaPixelId: e.target.value})} className="w-full h-12 rounded-xl border px-4 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fb-access-token" className="font-bold text-xs">Facebook Access Token</Label>
                <input id="fb-access-token" type="password" value={settings?.facebookAccessToken || ''} onChange={(e) => setSettings({...settings, facebookAccessToken: e.target.value})} className="w-full h-12 rounded-xl border px-4 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="search-console-meta" className="font-bold text-xs">Search Console Meta</Label>
                <input id="search-console-meta" value={settings?.searchConsoleMeta || ''} onChange={(e) => setSettings({...settings, searchConsoleMeta: e.target.value})} className="w-full h-12 rounded-xl border px-4 text-sm" />
              </div>
           </CardContent>
        </Card>

        {/* 3. AI Intelligence */}
        <Card className="lg:col-span-2 border-2 border-purple-500/20 shadow-none overflow-hidden rounded-3xl">
           <CardHeader className="bg-purple-500/5 border-b">
              <CardTitle className="flex items-center gap-2">
                 <Settings2 className="h-5 w-5 text-purple-600" /> AI Bot Configuration
              </CardTitle>
           </CardHeader>
           <CardContent className="p-6 space-y-6">
               <div className="space-y-2">
                <Label htmlFor="openrouter-api-key" className="font-bold text-xs">OpenRouter API Key</Label>
                <input id="openrouter-api-key" type="password" value={settings?.aiConfig?.openRouterApiKey || ''} onChange={(e) => setSettings({...settings, aiConfig: {...(settings?.aiConfig || {}), openRouterApiKey: e.target.value}})} className="w-full h-12 rounded-xl border px-4 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="system-prompt" className="font-bold text-xs">System Training Prompt</Label>
                <textarea id="system-prompt" value={settings?.aiConfig?.systemPrompt || ''} onChange={(e) => setSettings({...settings, aiConfig: {...(settings?.aiConfig || {}), systemPrompt: e.target.value}})} className="w-full h-24 rounded-xl border p-4 text-sm resize-none" />
              </div>
           </CardContent>
        </Card>

        {/* 4. Courier Logistics */}
        <Card className="lg:col-span-3 border-2 border-orange-500/20 shadow-none overflow-hidden rounded-3xl">
           <CardHeader className="bg-orange-500/5 border-b">
              <CardTitle className="flex items-center gap-2">
                 <Truck className="h-5 w-5 text-orange-600" /> Courier & Shipping Rules
              </CardTitle>
           </CardHeader>
           <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                  <div className="space-y-2">
                    <Label className="font-bold">Active Provider</Label>
                    <Select value={settings?.courierConfig?.activeProvider || 'none'} onValueChange={(v) => setSettings({...settings, courierConfig: {...(settings?.courierConfig || {}), activeProvider: v}})}>
                      <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="steadfast">Steadfast</SelectItem>
                        <SelectItem value="pathao">Pathao</SelectItem>
                        <SelectItem value="redx">RedX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inside-dhaka" className="font-bold">Inside Dhaka (TK)</Label>
                    <input id="inside-dhaka" type="number" value={settings?.deliveryChargeInsideDhaka || 0} onChange={(e) => setSettings({...settings, deliveryChargeInsideDhaka: Number(e.target.value)})} className="w-full h-12 rounded-xl border px-4" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="outside-dhaka" className="font-bold">Outside Dhaka (TK)</Label>
                    <input id="outside-dhaka" type="number" value={settings?.deliveryChargeOutsideDhaka || 0} onChange={(e) => setSettings({...settings, deliveryChargeOutsideDhaka: Number(e.target.value)})} className="w-full h-12 rounded-xl border px-4" />
                  </div>
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-2xl border">
                 <div className="md:col-span-2 font-black text-xs uppercase opacity-50 mb-2">Provider Credentials</div>
                  <div className="space-y-2">
                    <Label htmlFor="steadfast-api-key" className="font-bold text-xs">Steadfast API Key</Label>
                    <input id="steadfast-api-key" type="password" value={settings?.courierConfig?.steadfast?.apiKey || ''} onChange={(e) => setSettings({...settings, courierConfig: {...(settings?.courierConfig || {}), steadfast: {...(settings?.courierConfig?.steadfast || {}), apiKey: e.target.value}}})} className="w-full h-10 rounded-lg border px-3 text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pathao-store-id" className="font-bold text-xs">Pathao Store ID</Label>
                    <input id="pathao-store-id" value={settings?.courierConfig?.pathao?.storeId || ''} onChange={(e) => setSettings({...settings, courierConfig: {...(settings?.courierConfig || {}), pathao: {...(settings?.courierConfig?.pathao || {}), storeId: e.target.value}}})} className="w-full h-10 rounded-lg border px-3 text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="redx-api-key" className="font-bold text-xs">RedX API Key</Label>
                    <input id="redx-api-key" type="password" value={settings?.courierConfig?.redx?.apiKey || ''} onChange={(e) => setSettings({...settings, courierConfig: {...(settings?.courierConfig || {}), redx: {...(settings?.courierConfig?.redx || {}), apiKey: e.target.value}}})} className="w-full h-10 rounded-lg border px-3 text-xs" />
                  </div>
              </div>
           </CardContent>
        </Card>

        {/* 5. Payments */}
        <Card className="lg:col-span-1 border-2 border-blue-500/20 shadow-none overflow-hidden rounded-3xl">
           <CardHeader className="bg-blue-500/5 border-b">
              <CardTitle className="flex items-center gap-2">
                 <CreditCard className="h-5 w-5 text-blue-600" /> SSLCommerz
              </CardTitle>
           </CardHeader>
           <CardContent className="p-6 space-y-4">
               <div className="space-y-2">
                <Label htmlFor="ssl-store-id" className="font-bold text-xs">Store ID</Label>
                <input id="ssl-store-id" value={settings?.paymentConfig?.sslcommerz?.storeId || ''} onChange={(e) => setSettings({...settings, paymentConfig: {...(settings?.paymentConfig || {}), sslcommerz: {...(settings?.paymentConfig?.sslcommerz || {}), storeId: e.target.value}}})} className="w-full h-12 rounded-xl border px-4 text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ssl-store-password" className="font-bold text-xs">Store Password</Label>
                <input id="ssl-store-password" type="password" value={settings?.paymentConfig?.sslcommerz?.storePassword || ''} onChange={(e) => setSettings({...settings, paymentConfig: {...(settings?.paymentConfig || {}), sslcommerz: {...(settings?.paymentConfig?.sslcommerz || {}), storePassword: e.target.value}}})} className="w-full h-12 rounded-xl border px-4 text-sm" />
              </div>
           </CardContent>
        </Card>

        {/* 6. Layout & Templates */}
        <Card className="lg:col-span-2 border-2 shadow-none overflow-hidden rounded-3xl">
           <CardHeader className="bg-muted/30 border-b">
              <CardTitle className="flex items-center gap-2">
                 <Layout className="h-5 w-5 text-primary" /> Design Orchestration
              </CardTitle>
           </CardHeader>
           <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                <Label className="font-bold text-xs">Navbar</Label>
                <Select value={ui.navbar ?? TEMPLATE_OPTIONS[0]} onValueChange={(v) => updateTemplate('navbar', v)}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{TEMPLATE_OPTIONS.map(o => <SelectItem key={o} value={o}>Version {o.toUpperCase()}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs">Product Detail</Label>
                <Select value={ui.productDetail ?? TEMPLATE_OPTIONS[0]} onValueChange={(v) => updateTemplate('productDetail', v)}>
                  <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{TEMPLATE_OPTIONS.map(o => <SelectItem key={o} value={o}>Version {o.toUpperCase()}</SelectItem>)}</SelectContent>
                </Select>
              </div>
           </CardContent>
        </Card>

      </div>

      <div className="p-6 bg-primary/5 rounded-3xl border border-primary/20 flex items-center justify-between gap-4 mt-12">
        <div className="flex items-center gap-4">
           <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white"><Eye className="h-6 w-6" /></div>
           <div>
              <h3 className="font-bold">Live Preview Ready</h3>
              <p className="text-xs text-muted-foreground">Tenant-specific configurations are applied instantly upon saving.</p>
           </div>
        </div>
        <Button variant="outline" className="rounded-full font-bold" onClick={() => window.open('/', '_blank')}>View Store <ChevronRight className="h-4 w-4 ml-1" /></Button>
      </div>
    </div>
  );
}
