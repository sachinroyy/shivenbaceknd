// backend/src/models/Subscription.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  plan: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate?: Date;
  endDate?: Date;
  razorpaySubscriptionId?: string;
  razorpayPlanId?: string;
  razorpayCustomerId?: string;
  paymentMethod: string;
  lastPaymentDate?: Date;
  nextBillingDate?: Date;
  isActive: boolean;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    interval: { type: String, enum: ['month', 'year'], required: true },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired'],
      default: 'inactive',
    },
    startDate: { type: Date },
    endDate: { type: Date },
    razorpaySubscriptionId: { type: String },
    razorpayPlanId: { type: String },
    razorpayCustomerId: { type: String },
    paymentMethod: { type: String, default: 'razorpay' },
    lastPaymentDate: { type: Date },
    nextBillingDate: { type: Date },
    isActive: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscription>('Subscription', subscriptionSchema);