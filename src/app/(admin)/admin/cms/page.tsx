import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Layout, Type } from 'lucide-react';
import Link from 'next/link';

export default function CMSPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">CMS Manager</h1>
        <p className="text-muted-foreground text-sm">Manage dynamic content across the storefront</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <ImageIcon className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Banners</CardTitle>
              <CardDescription>Manage homepage promotional banners</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/admin/cms/banners">
              <Button variant="outline" className="w-full">Manage Banners</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Layout className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Sliders</CardTitle>
              <CardDescription>Manage main hero sliders</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/admin/cms/sliders">
              <Button variant="outline" className="w-full">Manage Sliders</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <Type className="h-8 w-8 text-primary" />
            <div>
              <CardTitle>Pages Content</CardTitle>
              <CardDescription>Edit About Us, Privacy Policy, Terms</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/admin/cms/pages">
              <Button variant="outline" className="w-full">Edit Pages</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
