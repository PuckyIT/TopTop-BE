/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as multer from 'multer';

@Injectable()
export class FileUploadService {
  multerOptions = multer({
    dest: './uploads/', // Thư mục lưu trữ tạm thời
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước tệp (5MB)
  });
}