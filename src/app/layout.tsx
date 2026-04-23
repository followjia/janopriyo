import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";
import "./prosemirror.css";
import connectToDatabase from "@/lib/db";
import GlobalSettings from "@/models/GlobalSettings";
import Script from "next/script";
import { PWARegistry } from "@/components/pwa-registry";
import GoogleTagManager from "./components/GoogleTagManager";
import FacebookPixel from "./components/FacebookPixel";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { ScrollProgress } from "@/components/layout/ScrollProgress";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { generateOrganizationSchema } from "@/lib/seo";

export const dynamic = 'force-dynamic';

async function getGlobalSettings() {
  try {
    await connectToDatabase();
    const settings = await GlobalSettings.findOne({}).sort({ updatedAt: -1 }).lean();

    if (!settings) {
      // Consistent fallback logic
      return {
        brandName: "Janopriyo Shop",
        contact: {
          email: "support@janopriyo.shop",
          phone: "+8801234567890",
          address: "Dhaka, Bangladesh"
        }
      };
    }
    return settings as any;
  } catch (error) {
    console.error("Critical error in settings fetch:", error);
    // Hardcoded defaults for ultimate resilience
    return {
      brandName: "Janopriyo Shop",
      contact: {
        email: "support@janopriyo.shop",
        phone: "+8801234567890",
        address: "Dhaka, Bangladesh"
      }
    };
  }
}


export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  try {
    const settings = await getGlobalSettings();

    return {
      metadataBase: new URL(baseUrl),
      title: {
        default: settings.metaTitle || settings.brandName || "Janopriyo Shop",
        template: `%s | ${settings.brandName || "Janopriyo Shop"}`,
      },
      description: settings.metaDescription || settings.brandName || "Your ultimate destination for quality products.",
      manifest: process.env.NODE_ENV === 'production' ? '/manifest.json' : undefined,
      appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: settings.brandName || "Janopriyo Shop",
      },
      formatDetection: {
        telephone: false,
      },
      openGraph: {
        title: settings.metaTitle || settings.brandName || "Janopriyo Shop",
        description: settings.metaDescription || settings.brandName || "Your ultimate destination for quality products.",
        url: baseUrl,
        siteName: settings.brandName || "Janopriyo Shop",
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: settings.metaTitle || settings.brandName || "Janopriyo Shop",
        description: settings.metaDescription || settings.brandName || "Your ultimate destination for quality products.",
      },
      verification: {
        google: settings.searchConsoleMeta,
      },
      alternates: {
        canonical: './',
      },

      other: {
        ...(settings.facebookDomainVerification
          ? { "facebook-domain-verification": settings.facebookDomainVerification }
          : {}),
      },
    };
  } catch (error) {
    return {
      title: "Janopriyo Shop",
      description: "Your ultimate destination for quality products.",
    };
  }
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getGlobalSettings();
  let jsonLd = null;

  try {
    jsonLd = generateOrganizationSchema(settings);
  } catch (e) {
    console.error("Error generating JSON-LD structured data", e);
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col overflow-x-hidden`}
        suppressHydrationWarning
      >
        <PWARegistry />
        {jsonLd && (
          <Script
            id="json-ld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
        <Providers>
          <GoogleTagManager gtmId={settings.googleTagManagerId} />
          <Suspense fallback={null}>
            <FacebookPixel
              pixelId={process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || settings.metaPixelId}
            />
          </Suspense>
          <SmoothScroll>
            {children}
            <ScrollProgress />
            <ScrollToTop />
          </SmoothScroll>
        </Providers>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
