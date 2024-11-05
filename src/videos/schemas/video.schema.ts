/* eslint-disable prettier/prettier */
// videos/schemas/video.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Video extends Document {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  path: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const VideoSchema = SchemaFactory.createForClass(Video);