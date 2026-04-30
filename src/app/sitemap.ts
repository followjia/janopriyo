/* eslint-disable @typescript-eslint/no-explicit-any */
import { MetadataRoute } from "next";
import connectToDatabase from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Blog from "@/models/Blog";

export const dynamic = "force-dynamic";

const BASE_URL = "https://www.janopriyo.com";

const getDynamicRoutes = async (): Promise<MetadataRoute.Sitemap> => {
  try {
    await connectToDatabase();

    // Use safety limits to prevent OOM and stay within standard sitemap limits (max 50k URLs)
    const [products, categories, blogs] = await Promise.all([
      Product.find({ isPublished: true }, "slug updatedAt")
        .sort({ updatedAt: -1 })
        .limit(40000)
        .lean()
        .exec(),
      Category.find({ isActive: true }, "slug updatedAt")
        .sort({ updatedAt: -1 })
        .limit(5000)
        .lean()
        .exec(),
      Blog.find({ isPublished: true }, "slug updatedAt")
        .sort({ updatedAt: -1 })
        .limit(4000)
        .lean()
        .exec(),
    ]);

    const productRoutes: MetadataRoute.Sitemap = products.map((item: any) => ({
      url: `${BASE_URL}/product/${item.slug}`,
      lastModified: item.updatedAt || new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));

    const categoryRoutes: MetadataRoute.Sitemap = categories.map((item: any) => ({
      url: `${BASE_URL}/shop?category=${encodeURIComponent(item.slug)}`,
      lastModified: item.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const blogRoutes: MetadataRoute.Sitemap = blogs.map((item: any) => ({
      url: `${BASE_URL}/blog/${item.slug}`,
      lastModified: item.updatedAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [
      ...productRoutes,
      ...categoryRoutes,
      ...blogRoutes,
    ];
  } catch (error) {
    console.error("Error generating dynamic sitemap routes:", error);
    return [];
  }
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicRoutes = await getDynamicRoutes();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  return [...staticRoutes, ...dynamicRoutes];
}
