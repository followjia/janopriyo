import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectToDatabase from '@/lib/db';
import mongoose from 'mongoose';

const toSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const makeBlogContent = (title: string, index: number) =>
  JSON.stringify({
    type: 'doc',
    content: [
      { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: title }] },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: `This is demo blog post #${index}. It is seeded automatically for UI testing and layout validation.`,
          },
        ],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'You can edit or delete this content from the admin panel after verifying listing and detail pages.',
          },
        ],
      },
    ],
  });

export async function POST() {
  try {
    const session = await auth();
    if (!session || !session.user || !(['admin', 'super_admin'].includes((session.user as any)?.role)) && .role !== 'super_admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) {
      return NextResponse.json({ message: 'Database is not connected' }, { status: 500 });
    }

    const blogsCollection = db.collection('blogs');
    const productsCollection = db.collection('products');
    const now = new Date();

    const blogDocs = Array.from({ length: 10 }, (_, i) => {
      const number = i + 1;
      const title = `Demo Blog Post ${number}`;
      return {
        title,
        slug: `demo-blog-post-${number}`,
        metaTitle: `${title} | Janopriyo Shop`,
        metaDescription: `Demo SEO description for blog post ${number}.`,
        content: makeBlogContent(title, number),
        thumbnail: `https://picsum.photos/seed/blog-${number}/1280/720`,
        isPublished: true,
        createdAt: new Date(now.getTime() - number * 86400000),
        updatedAt: now,
      };
    });

    const productDocs = Array.from({ length: 50 }, (_, i) => {
      const number = i + 1;
      const name = `Demo Product ${number}`;
      const price = 200 + number * 15;
      const salePrice = number % 3 === 0 ? Math.max(100, price - 40) : undefined;
      const stock = (number % 10) + 5;

      return {
        name,
        slug: toSlug(name),
        description: `This is demo product ${number} used for testing storefront and admin product interfaces.`,
        price,
        salePrice,
        discountRate: salePrice ? Math.round(((price - salePrice) / price) * 100) : undefined,
        sku: `DEMO-SKU-${String(number).padStart(4, '0')}`,
        stock,
        categories: [],
        tags: ['demo', 'seeded', number % 2 === 0 ? 'featured' : 'standard'],
        images: [`https://picsum.photos/seed/product-${number}/1000/1000`],
        attributes: [
          { key: 'Brand', value: 'Janopriyo Demo' },
          { key: 'Material', value: number % 2 === 0 ? 'Cotton' : 'Polyester' },
        ],
        variants: [],
        isFeatured: number % 5 === 0,
        isNewArrival: number > 40,
        isPublished: true,
        ratings: 0,
        numReviews: 0,
        createdAt: new Date(now.getTime() - number * 3600000),
        updatedAt: now,
      };
    });

    const blogSlugs = blogDocs.map((blog) => blog.slug);
    const productSlugs = productDocs.map((product) => product.slug);

    await blogsCollection.deleteMany({ slug: { $in: blogSlugs } });
    await productsCollection.deleteMany({ slug: { $in: productSlugs } });

    const insertedBlogs = await blogsCollection.insertMany(blogDocs);
    const insertedProducts = await productsCollection.insertMany(productDocs);

    const verifiedBlogs = await blogsCollection.countDocuments({ slug: { $in: blogSlugs }, isPublished: true });
    const verifiedProducts = await productsCollection.countDocuments({ slug: { $in: productSlugs }, isPublished: true });

    return NextResponse.json({
      message: 'Demo data seeded successfully.',
      blogsInserted: Object.keys(insertedBlogs.insertedIds).length,
      productsInserted: Object.keys(insertedProducts.insertedIds).length,
      verifiedPublishedBlogs: verifiedBlogs,
      verifiedPublishedProducts: verifiedProducts,
    });
  } catch (error) {
    console.error('Error seeding demo data:', error);
    return NextResponse.json({ message: 'Failed to seed demo data' }, { status: 500 });
  }
}
