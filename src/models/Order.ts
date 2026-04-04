import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface IOrder extends Document {
  user?: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  status: 'Order Placed' | 'Confirmed' | 'Paid' | 'Ready for Delivery' | 'Released for Delivery' | 'Cancelled' | 'Delivered';
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema<IOrder> = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: [1, 'Quantity must be at least 1'] },
        price: { type: Number, required: true, min: [0.01, 'Price must be at least 0.01'] },
        image: { type: String },
      },
    ],
    totalAmount: { type: Number, required: true, min: [0, 'Total amount cannot be negative'] },
    shippingAddress: {
      type: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        country: { type: String, required: true },
      },
      required: [true, 'Shipping address is required'],
    },
    paymentMethod: { type: String, required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
    status: {
      type: String,
      enum: ['Order Placed', 'Confirmed', 'Paid', 'Ready for Delivery', 'Released for Delivery', 'Cancelled', 'Delivered'],
      default: 'Order Placed',
    },
    transactionId: { type: String },
  },
  { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
