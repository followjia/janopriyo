import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  sku: string;
  stock: number;
  categories: mongoose.Types.ObjectId[];
  tags: string[];
  images: string[];
  attributes: {
    key: string;
    value: string;
  }[];
  isFeatured: boolean;
  isPublished: boolean;
  ratings: number;
  numReviews: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: [0, 'Price cannot be negative'] },
    salePrice: { 
      type: Number,
      min: [0, 'Sale price cannot be negative'],
    },
    sku: { type: String, required: true, unique: true },
    stock: { type: Number, required: true, default: 0, min: [0, 'Stock cannot be negative'] },
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    tags: [{ type: String }],
    images: [{ type: String }],
    attributes: [
      {
        key: { type: String },
        value: { type: String },
      },
    ],
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },
    ratings: { type: Number, default: 0, min: [0, 'Rating cannot be below 0'], max: [5, 'Rating cannot be above 5'] },
    numReviews: { type: Number, default: 0, min: [0, 'Number of reviews cannot be negative'] },
  },
  { timestamps: true }
);

ProductSchema.pre('validate', function (this: any, next: any) {
  if (this.salePrice !== undefined && this.salePrice !== null && this.salePrice > this.price) {
    return next(
      new Error(`Sale price (${this.salePrice}) should be lower than or equal to regular price (${this.price})`)
    );
  }
  next();
});

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
