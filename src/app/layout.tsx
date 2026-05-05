import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";
import "./prosemirror.css";
import Script from "next/script";
import { PWARegistry } from "@/components/pwa-registry";
import GoogleTagManager from "./components/GoogleTagManager";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { generateOrganizationSchema } from "@/lib/seo";
import FacebookPixel from "./components/FacebookPixel";
import SubscriptionBlocker from "./components/SubscriptionBlocker";
import { headers } from "next/headers";
import { getCachedSettings } from "@/lib/data-fetching";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const hostname = headersList.get('host') || 'localhost';
  const baseUrl = `https://${hostname}`;

  try {
    const settings = await getCachedSettings(hostname);

    if (!settings) throw new Error("No settings found");

    return {
      metadataBase: new URL(baseUrl),
      title: {
        default: settings.metaTitle || settings.brandName || "Janopriyo Shop",
        template: `%s | ${settings.brandName || "Janopriyo Shop"}`,
      },
      description: settings.metaDescription || settings.brandName || "Your ultimate destination for quality products.",
      manifest: '/manifest.json',
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
  const headersList = await headers();
  const hostname = headersList.get('host') || 'localhost';
  const pathname = headersList.get('x-invoke-path') || '';
  const settings = await getCachedSettings(hostname);

  let jsonLd = null;
  try {
    if (settings) {
      jsonLd = generateOrganizationSchema(settings);
    }
  } catch (e) {
    console.error("Error generating JSON-LD structured data", e);
  }

  // Subscription Enforcement Logic
  const sub = settings?.saasSubscription;
  // If sub is missing, default to not expired (allow access by default)
  const isExpired = sub ? (sub.status !== 'Active' || (sub.expiryDate && new Date(sub.expiryDate) < new Date())) : false;

  // Allow system-design routes to bypass blocker so they can fix the subscription
  const isSystemDesign = pathname.includes('/admin/system-design');
  const showBlocker = isExpired && !isSystemDesign;

  // Security Helper: Validate GA ID format (G-XXXX or UA-XXXX)
  const isValidGAId = (id?: string) => id ? /^(G-[A-Z0-9]{10}|UA-\d{4,}-\d+)$/.test(id) : false;
  const gaId = settings?.googleAnalyticsId;

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
          {showBlocker && <SubscriptionBlocker brandName={settings?.brandName || 'Store'} />}
          {settings?.googleTagManagerId && (
            <GoogleTagManager gtmId={settings.googleTagManagerId} />
          )}

          <Suspense fallback={null}>
            <FacebookPixel
              pixelId={settings?.metaPixelId || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID}
            />
          </Suspense>

          {isValidGAId(gaId) && (
            <>
              <Script
                id="google-analytics"
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              />
              <Script
                id="ga-init"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${gaId}');
                  `,
                }}
              />
            </>
          )}

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
