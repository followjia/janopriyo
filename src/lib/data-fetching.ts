import { unstable_cache } from 'next/cache';
import connectToDatabase from './db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import Banner from '@/models/Banner';
import Blog from '@/models/Blog';
import FAQ from '@/models/FAQ';
import GlobalSettings from '@/models/GlobalSettings';
import Coupon from '@/models/Coupon';

// Helper to serialize MongoDB data
const serialize = (data: any) => JSON.parse(JSON.stringify(data));

/**
 * CACHE_TAGS constants for consistency
 */
export const CACHE_TAGS = {
  products: 'products',
  categories: 'categories',
  banners: 'banners',
  blogs: 'blogs',
  faqs: 'faqs',
  settings: 'settings',
  coupons: 'coupons',
};

// --- PRODUCTS ---

export const getCachedProducts = unstable_cache(
  async (query = {}, limit = 10, sort = { createdAt: -1 }) => {
    await connectToDatabase();
    const products = await Product.find({ isPublished: true, ...query })
      .populate('categories')
      .sort(sort as any)
      .limit(limit)
      .lean();
    return serialize(products);
  },
  ['products-list'],
  { revalidate: 31536000, tags: [CACHE_TAGS.products] }
);

export const getCachedProductBySlug = unstable_cache(
  async (slug: string) => {
    await connectToDatabase();
    const product = await Product.findOne({ slug })
      .populate('categories')
      .lean();
    return serialize(product);
  },
  ['product-detail'],
  { revalidate: 31536000, tags: [CACHE_TAGS.products] } // We use a general tag for now
);

// --- CATEGORIES ---

export const getCachedCategories = unstable_cache(
  async () => {
    await connectToDatabase();
    const categories = await Category.find({ isActive: true })
      .populate('parentCategory', 'name')
      .sort({ createdAt: -1 })
      .lean();
    return serialize(categories);
  },
  ['categories-list'],
  { revalidate: 31536000, tags: [CACHE_TAGS.categories] }
);

// --- BANNERS ---

export const getCachedBanners = unstable_cache(
  async () => {
    await connectToDatabase();
    const banners = await Banner.find({ isActive: true })
      .sort({ order: 1 })
      .lean();
    return serialize(banners);
  },
  ['banners-list'],
  { revalidate: 31536000, tags: [CACHE_TAGS.banners] }
);

// --- BLOGS ---

export const getCachedBlogs = unstable_cache(
  async (limit = 10) => {
    await connectToDatabase();
    const blogs = await Blog.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    return serialize(blogs);
  },
  ['blogs-list'],
  { revalidate: 31536000, tags: [CACHE_TAGS.blogs] }
);

export const getCachedBlogBySlug = unstable_cache(
  async (slug: string) => {
    await connectToDatabase();
    const blog = await Blog.findOne({ slug, isPublished: true }).lean();
    return serialize(blog);
  },
  ['blog-detail'],
  { revalidate: 31536000, tags: [CACHE_TAGS.blogs] }
);

// --- FAQs ---

export const getCachedFAQs = unstable_cache(
  async () => {
    await connectToDatabase();
    const faqs = await FAQ.find({ isActive: true }).sort({ order: 1 }).lean();
    return serialize(faqs);
  },
  ['faqs-list'],
  { revalidate: 31536000, tags: [CACHE_TAGS.faqs] }
);

// --- SETTINGS ---

/**
 * Fetches global settings for the storefront.
 * In a multi-tenant environment, this resolves settings based on the domain (hostname).
 */
export const getCachedSettings = (hostname: string = 'localhost') => {
  return unstable_cache(
    async () => {
      await connectToDatabase();
      
      // Find settings for this specific domain
      // If not found, fallback to the 'main' store or first record
      let settings = await GlobalSettings.findOne({ domain: hostname }).lean();
      
      if (!settings) {
        settings = await GlobalSettings.findOne({ storeId: 'main' }).lean() || await GlobalSettings.findOne().lean();
      }

      return serialize(settings);
    },
    ['settings-by-domain', hostname],
    { tags: [CACHE_TAGS.settings], revalidate: 3600 }
  )();
};

// --- COUPONS ---

export const getCachedActiveCoupon = unstable_cache(
  async () => {
    await connectToDatabase();
    const coupon = await Coupon.findOne({ 
      isActive: true, 
      expiryDate: { $gt: new Date() } 
    }).sort({ createdAt: -1 }).lean();
    return serialize(coupon);
  },
  ['active-coupon'],
  { revalidate: 31536000, tags: [CACHE_TAGS.coupons] }
);
