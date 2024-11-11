/* eslint-disable prettier/prettier */
// multer.service.ts

import { Injectable } from '@nestjs/common';
import * as multer from 'multer';

@Injectable()
export class MulterService {
  multerInstance() {
    return multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, './uploads'); // Đường dẫn đến thư mục lưu trữ tạm thời
        },
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`); // Đặt tên file khi upload
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn dung lượng file (ví dụ: 5MB)
      fileFilter: (req, file, cb) => {
        if (file.mimetype.includes('image')) {
          cb(null, true); // Chỉ cho phép upload ảnh
        } else {
          cb(new Error('File không phải ảnh'));
        }
      },
    });
  }
}