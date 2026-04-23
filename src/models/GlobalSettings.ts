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
    linkedin?: string;
    tiktok?: string;
    whatsapp?: string;
  };
  marqueeText?: string;
  freeDeliveryThreshold?: number;
  deliveryChargeInsideDhaka?: number;
  deliveryChargeOutsideDhaka?: number;
  metaTitle?: string;
  metaDescription?: string;
  googleTagManagerId?: string;
  searchConsoleMeta?: string;
  facebookDomainVerification?: string;
  metaPixelId?: string;
  facebookAccessToken?: string;
  facebookTestEventCode?: string;
  courierConfig?: {
    activeProvider?: 'steadfast' | 'pathao' | 'redx' | 'none';
    steadfast?: {
      apiKey: string;
      secretKey: string;
    };
    pathao?: {
      clientId: string;
      clientSecret: string;
      storeId: string;
    };
    redx?: {
      apiKey: string;
    };
  };
  subscriptionConfig: {
    activationThreshold: number;
    rewardPercentage: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

import { encrypt, decrypt } from '@/lib/encryption';

const GlobalSettingsSchema: Schema<IGlobalSettings> = new Schema(
  {
    brandName: { type: String },
    logo: { type: String },
    favicon: { type: String },
    contact: {
      email: { type: String },
      phone: { type: String },
      address: { type: String },
    },
    socialLinks: {
      facebook: { type: String },
      twitter: { type: String },
      instagram: { type: String },
      youtube: { type: String },
      linkedin: { type: String },
      tiktok: { type: String },
      whatsapp: { type: String },
    },
    marqueeText: { type: String },
    freeDeliveryThreshold: { type: Number, default: 0 },
    deliveryChargeInsideDhaka: { type: Number, default: 60 },
    deliveryChargeOutsideDhaka: { type: Number, default: 120 },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    googleTagManagerId: { type: String },
    searchConsoleMeta: { type: String },
    facebookDomainVerification: { type: String },
    metaPixelId: { type: String },
    facebookAccessToken: { type: String, get: decrypt, set: encrypt },
    facebookTestEventCode: { type: String },
    courierConfig: {
      activeProvider: { type: String, enum: ['steadfast', 'pathao', 'redx', 'none'], default: 'none' },
      steadfast: {
        apiKey: { type: String, get: decrypt, set: encrypt },
        secretKey: { type: String, get: decrypt, set: encrypt },
      },
      pathao: {
        clientId: { type: String, get: decrypt, set: encrypt },
        clientSecret: { type: String, get: decrypt, set: encrypt },
        storeId: { type: String, get: decrypt, set: encrypt },
      },
      redx: {
        apiKey: { type: String, get: decrypt, set: encrypt },
      },
    },
    subscriptionConfig: {
      activationThreshold: { type: Number, default: 5000 },
      rewardPercentage: { type: Number, default: 5 },
    },
  },
  { 
    timestamps: true,
    toJSON: { 
      getters: false, // Prevent automatic decryption and exposure in API responses
      transform: (doc, ret) => {
        // Security: Explicitly remove sensitive courier credentials from serialized output
        if (ret.courierConfig) {
          delete ret.courierConfig.steadfast;
          delete ret.courierConfig.pathao;
          delete ret.courierConfig.redx;
        }
        // Security: Remove sensitive Facebook Access Token
        delete ret.facebookAccessToken;
        return ret;
      }
    },
    toObject: { getters: true } // Keep getters enabled for internal server-side logic
  }
);

const GlobalSettings: Model<IGlobalSettings> =
  mongoose.models.GlobalSettings || mongoose.model<IGlobalSettings>('GlobalSettings', GlobalSettingsSchema);

export default GlobalSettings;
