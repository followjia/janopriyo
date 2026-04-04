import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import "./globals.css";
import connectToDatabase from "@/lib/db";
import GlobalSettings from "@/models/GlobalSettings";
 
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
 
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
 
import { generateOrganizationSchema } from "@/lib/seo";
 
async function getGlobalSettings() {
  try {
    await connectToDatabase();
    const settings = await GlobalSettings.findOne({}).lean();
    
    if (!settings) {
      // Consistent fallback logic
      return {
        brandName: process.env.NEXT_PUBLIC_STORE_NAME || "Janopriyo Shop",
        logo: "/logo.png",
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
      logo: "/logo.png",
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
 
import Script from "next/script";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let jsonLd = null;
 
  try {
    const settings = await getGlobalSettings();
    jsonLd = generateOrganizationSchema(settings);
  } catch (e) {
    console.error("Error generating JSON-LD structured data", e);
  }
 
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {jsonLd && (
          <script
            id="json-ld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
      </head>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full flex flex-col`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
