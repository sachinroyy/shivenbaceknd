import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  authId: string;
  provider: string;
  role: 'user' | 'admin';
  googleId?: string;  // Make this optional with ?
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    authId: { type: String, required: true },
    provider: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user', required: true },
    googleId: { type: String, sparse: true },

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

export default mongoose.model<IUser>('User', userSchema);
