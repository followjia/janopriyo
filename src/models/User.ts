import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  image?: string;
  phone?: string;
  googleId?: string;
  addresses: {
    street?: string;
    division?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    isDefault?: boolean;
  }[];
  wishlist: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.[A-Za-z]{2,})+$/, 'Please provide a valid email address'] 
    },
    password: { type: String, select: false },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    image: { type: String },
    phone: { type: String },
    googleId: { type: String },
    addresses: [
      {
        street: { type: String },
        division: { type: String },
        city: { type: String },
        state: { type: String },
        zipCode: { type: String },
        country: { type: String },
        isDefault: { type: Boolean, default: false },
      },
    ],
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true }
);

UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
