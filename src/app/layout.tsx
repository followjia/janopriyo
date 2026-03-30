import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { generateOrganizationSchema } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${baseUrl}/api/settings`, { 
        cache: 'force-cache', 
        next: { tags: ['settings'] } 
    });
    const settings = await res.json();
    
    return {
      title: {
          default: settings.brandName || "Janopriyo Shop",
          template: `%s | ${settings.brandName || "Janopriyo Shop"}`,
      },
      description: settings.brandName || "Your ultimate destination for quality products.",
      openGraph: {
        title: settings.brandName || "Janopriyo Shop",
        description: "Your ultimate destination for quality products.",
        url: baseUrl,
        siteName: settings.brandName || "Janopriyo Shop",
        images: settings.logo ? [{ url: settings.logo }] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: settings.brandName || "Janopriyo Shop",
        description: "Your ultimate destination for quality products.",
        images: settings.logo ? [settings.logo] : [],
      },
      verification: {
        google: settings.searchConsoleMeta || '',
      },
    };
  } catch (error) {
    return {
      title: "Janopriyo Shop",
      description: "Your ultimate destination for quality products across multiple categories.",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  let jsonLd = null;

  try {
    const res = await fetch(`${baseUrl}/api/settings`, { 
        cache: 'force-cache', 
        next: { tags: ['settings'] } 
    });
    const settings = await res.json();
    jsonLd = generateOrganizationSchema(settings);
  } catch (e) {
    console.error("Error fetching settings for JSON-LD");
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col`}
        suppressHydrationWarning
      >
        {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
        <Providers>
          {children}
        </Providers>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
