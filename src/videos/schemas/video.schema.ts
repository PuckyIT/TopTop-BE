/* eslint-disable prettier/prettier */
// videos/schemas/video.schema.ts

import { Schema, Types, Document } from 'mongoose';

export interface Video extends Document {
  userId: Types.ObjectId;
  videoUrl: string;
  cloudinaryId?: string;
  cloudinaryUrl?: string;
  title: string;
  likes: Types.ObjectId[];
  shares: Types.ObjectId[];
  comments: {
    userId: Types.ObjectId;
    content: string;
    timestamp: Date;
  }[];
  savedBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export const VideoSchema = new Schema<Video>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    videoUrl: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    cloudinaryUrl: { type: String, required: true },
    title: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    shares: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        content: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    savedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true },
);