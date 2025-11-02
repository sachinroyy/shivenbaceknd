import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
  title: string;
  category: string;
  slug: string;
  metaDescription: string;
  featuredImage: string;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    metaDescription: {
      type: String,
      required: [true, 'Meta description is required'],
    },
    featuredImage: {
      type: String,
      required: [true, 'Featured image is required'],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBlog>('Blog', blogSchema);
