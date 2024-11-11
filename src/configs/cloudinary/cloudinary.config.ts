/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as crypto from 'crypto';
import { Stream } from 'stream';
import * as dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Injectable()
export class CloudinaryService {
  async uploadImage(fileBuffer: Buffer): Promise<any> {
    const timestamp = Math.floor(Date.now() / 1000);  // Tính toán timestamp (thời gian Unix)

    // Tạo chuỗi ký (string to sign)
    const stringToSign = `folder=Top-Top&timestamp=${timestamp}`;

    // Tạo signature bằng cách mã hóa chuỗi ký với API secret
    const signature = crypto
      .createHash('sha1')
      .update(stringToSign + process.env.CLOUDINARY_API_SECRET)
      .digest('hex');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'Top-Top',  // Chỉ định thư mục
          timestamp: timestamp,  // Thêm timestamp
          signature: signature,  // Thêm signature
          api_key: process.env.CLOUDINARY_API_KEY,  // Thêm api_key trực tiếp nếu cần
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );

      const bufferStream = new Stream.PassThrough();
      bufferStream.end(fileBuffer);
      bufferStream.pipe(uploadStream);
    });
  }
}