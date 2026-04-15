import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  thumbnail?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema: Schema = new Schema(
  {
    title: { 
      type: String, 
      required: [true, 'Title is required'],
      trim: true 
    },
    slug: { 
      type: String, 
      required: [true, 'Slug is required'], 
      unique: true,
      maxlength: [100, 'Slug cannot exceed 100 characters'],
      lowercase: true,
      trim: true 
    },
    metaTitle: { 
      type: String, 
      required: [true, 'Meta Title is required'],
      maxlength: [100, 'Meta Title cannot exceed 100 characters'],
      trim: true 
    },
    metaDescription: { 
      type: String, 
      required: [true, 'Meta Description is required'],
      maxlength: [200, 'Meta Description cannot exceed 200 characters'],
      trim: true 
    },
    content: { 
      type: String, 
      required: [true, 'Content is required'] 
    },
    thumbnail: { 
      type: String 
    },
    isPublished: { 
      type: Boolean, 
      default: true 
    },
  },
  { 
    timestamps: true 
  }
);

// We'll handle the slug generation on the frontend/API instead of a pre-save hook 
// to give the user better control over the "live auto-generate" requirement.

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);
