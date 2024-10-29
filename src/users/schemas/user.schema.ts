/* eslint-disable prettier/prettier */
// user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  [x: string]: any;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: false })
  isActive: boolean;

  @Prop()
  createdAt: Date;

  @Prop({ type: String })
  resetOtp: string;

  @Prop({ type: Date })
  resetOtpExpire: Date;

  @Prop({ type: String })
  avatar?: string;

  constructor(user: Partial<User>) { // Sử dụng Partial để cho phép tạo đối tượng không đầy đủ
    this._id = user._id ? user._id.toString() : undefined; // Chỉ lấy _id nếu có
    this.email = user.email;
    this.password = user.password;
    this.role = user.role || 'user'; // Giá trị mặc định cho role
    this.isActive = user.isActive || false; // Giá trị mặc định cho isActive
    this.createdAt = user.createdAt || new Date(); // Giá trị mặc định cho createdAt
    this.resetOtp = user.resetOtp;
    this.resetOtpExpire = user.resetOtpExpire;
    this.avatar = user.avatar; // Lưu avatar
  }
}

export const UserSchema = SchemaFactory.createForClass(User);