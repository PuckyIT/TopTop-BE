/* eslint-disable prettier/prettier */
// videos/videos.controller.ts

import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('videos')
export class VideoController {
  @Post('upload')
  @UseInterceptors(FileInterceptor('video')) // Ensure this matches the key in your form-data
  uploadVideo(@UploadedFile() file: Express.Multer.File) {
    console.log(file); // Check what is being received
  }
}