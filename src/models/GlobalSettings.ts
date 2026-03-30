import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IGlobalSettings extends Document {
  brandName: string;
  logo: string;
  favicon?: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  socialLinks: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  marqueeText?: string;
  googleTagManagerId?: string;
  searchConsoleMeta?: string;
  metaPixelId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GlobalSettingsSchema: Schema<IGlobalSettings> = new Schema(
  {
    brandName: { type: String, required: true },
    logo: { type: String, required: true },
    favicon: { type: String },
    contact: {
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
    },
    socialLinks: {
      facebook: { type: String },
      twitter: { type: String },
      instagram: { type: String },
      youtube: { type: String },
    },
    marqueeText: { type: String },
    googleTagManagerId: { type: String },
    searchConsoleMeta: { type: String },
    metaPixelId: { type: String },
  },
  { timestamps: true }
);

const GlobalSettings: Model<IGlobalSettings> =
  mongoose.models.GlobalSettings || mongoose.model<IGlobalSettings>('GlobalSettings', GlobalSettingsSchema);

export default GlobalSettings;
