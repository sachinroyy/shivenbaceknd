import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'in-progress' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: false },
    message: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['new', 'in-progress', 'resolved'], 
      default: 'new' 
    },
  },
  { 
    timestamps: true 
  }
);

export default mongoose.model<IContact>('Contact', contactSchema);
