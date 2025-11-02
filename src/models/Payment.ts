import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  orderId: string;
  paymentId: string;
  signature: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  planId: string;
  email: string;
  phone: string;
  paymentDate: Date;
  subscription?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { 
      type: String, 
      required: [true, 'Order ID is required'],
      unique: true 
    },
    paymentId: { 
      type: String, 
      required: [true, 'Payment ID is required'],
      unique: true 
    },
    signature: { 
      type: String, 
      required: [true, 'Signature is required'] 
    },
    amount: { 
      type: Number, 
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be at least 1'],
      set: function(val: number) { return Math.round(val * 100) / 100; }
    },
    currency: { 
      type: String, 
      default: 'INR',
      uppercase: true
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed'],
      default: 'pending' 
    },
    planId: { 
      type: String, 
      required: [true, 'Plan ID is required'] 
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      index: true 
    },
    phone: { 
      type: String, 
      required: [true, 'Phone is required'],
      trim: true
    },
    paymentDate: { 
      type: Date, 
      default: Date.now 
    },
    subscription: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription',
      required: false
    }
  },
  { 
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
