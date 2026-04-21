import fs from "node:fs";
import path from "node:path";
import mongoose from "mongoose";

function loadEnvFile() {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) return;

  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function toSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeBlogContent(title, index) {
  return JSON.stringify({
    type: "doc",
    content: [
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: title }] },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: `This is demo blog post #${index}. It is seeded automatically for UI testing and layout validation.`,
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "You can edit or delete this content from the admin panel after verifying the blog listing and detail pages.",
          },
        ],
      },
    ],
  });
}

async function seed() {
  loadEnvFile();

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is missing. Add it to .env.local.");
  }

  await mongoose.connect(mongoUri, { bufferCommands: false });
  const db = mongoose.connection.db;

  const blogsCollection = db.collection("blogs");
  const productsCollection = db.collection("products");

  const now = new Date();
  const blogDocs = Array.from({ length: 10 }, (_, i) => {
    const number = i + 1;
    const title = `Demo Blog Post ${number}`;
    const slug = `demo-blog-post-${number}`;
    return {
      title,
      slug,
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
    const slug = toSlug(name);
    const price = 200 + number * 15;
    const salePrice = number % 3 === 0 ? Math.max(100, price - 40) : undefined;
    const stock = (number % 10) + 5;
    return {
      name,
      slug,
      description: `This is demo product ${number} used for testing storefront and admin product interfaces.`,
      price,
      salePrice,
      discountRate: salePrice ? Math.round(((price - salePrice) / price) * 100) : undefined,
      sku: `DEMO-SKU-${String(number).padStart(4, "0")}`,
      stock,
      categories: [],
      tags: ["demo", "seeded", number % 2 === 0 ? "featured" : "standard"],
      images: [`https://picsum.photos/seed/product-${number}/1000/1000`],
      attributes: [
        { key: "Brand", value: "Janopriyo Demo" },
        { key: "Material", value: number % 2 === 0 ? "Cotton" : "Polyester" },
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

  const blogSlugs = blogDocs.map((b) => b.slug);
  const productSlugs = productDocs.map((p) => p.slug);

  await blogsCollection.deleteMany({ slug: { $in: blogSlugs } });
  await productsCollection.deleteMany({ slug: { $in: productSlugs } });

  const blogResult = await blogsCollection.insertMany(blogDocs);
  const productResult = await productsCollection.insertMany(productDocs);

  console.log(`Inserted ${Object.keys(blogResult.insertedIds).length} demo blogs.`);
  console.log(`Inserted ${Object.keys(productResult.insertedIds).length} demo products.`);

  const publishedBlogs = await blogsCollection.countDocuments({ slug: { $in: blogSlugs }, isPublished: true });
  const publishedProducts = await productsCollection.countDocuments({ slug: { $in: productSlugs }, isPublished: true });

  console.log(`Verified published blogs: ${publishedBlogs}`);
  console.log(`Verified published products: ${publishedProducts}`);

  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("Seeding failed:", error.message);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect errors
  }
  process.exit(1);
});
