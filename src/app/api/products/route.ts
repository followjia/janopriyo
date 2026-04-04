import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import connectToDatabase from '@/lib/db';
import Product from '@/models/Product';
import { auth } from '@/auth';

// GET all products
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const searchParams = req.nextUrl.searchParams;
    const ids = searchParams.get('ids');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const skip = (page - 1) * limit;

    const query: any = {};
    if (ids) {
      query._id = { $in: ids.split(',') };
    }

    const products = await Product.find(query)
      .populate('categories')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create a new product (Admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    
    if (!session || !session.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ message: 'Invalid JSON request body' }, { status: 400 });
    }

    const { name, slug, description, sku, categories, tags, images, attributes, isFeatured, isPublished } = body;
    let { price, salePrice, stock } = body;

    // Numeric validation and coercion
    const parsedPrice = parseFloat(price);
    const parsedSalePrice = salePrice !== undefined && salePrice !== '' ? parseFloat(salePrice) : undefined;
    const parsedStock = stock !== undefined && stock !== '' ? parseInt(stock) : 0;

    // Validate required fields and price
    if (!name || !slug || !description || !sku || isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json({ 
        message: 'Invalid or missing required fields. Price must be a positive number.' 
      }, { status: 400 });
    }

    // Validate salePrice logic
    if (parsedSalePrice !== undefined) {
      if (isNaN(parsedSalePrice) || parsedSalePrice < 0 || parsedSalePrice > parsedPrice) {
        return NextResponse.json({ 
          message: 'Sale price must be a non-negative number and less than or equal to the regular price.' 
        }, { status: 400 });
      }
    }

    // Validate stock
    if (isNaN(parsedStock) || parsedStock < 0) {
      return NextResponse.json({ message: 'Stock must be a non-negative integer.' }, { status: 400 });
    }

    await connectToDatabase();

    try {
      const newProduct = await Product.create({
        name,
        slug,
        description,
        price: parsedPrice,
        salePrice: parsedSalePrice,
        sku,
        stock: parsedStock,
        categories: categories || [],
        tags: tags || [],
        images: images || [],
        attributes: attributes || [],
        isFeatured: isFeatured !== undefined ? isFeatured : false,
        isPublished: isPublished !== undefined ? isPublished : true,
      });

      revalidateTag('products', 'default');
      return NextResponse.json(newProduct, { status: 201 });
    } catch (error: any) {
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern || {})[0] || 'slug/SKU';
        return NextResponse.json({ 
          message: `Product with this ${field} already exists.` 
        }, { status: 400 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
