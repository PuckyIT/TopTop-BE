/* eslint-disable prettier/prettier */
// videos/videos.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video } from './schemas/video.schema';

@Injectable()
export class VideosService {
  constructor(@InjectModel(Video.name) private readonly videoModel: Model<Video>) {}

  async uploadVideo(file: Express.Multer.File, userId: string) {
    const newVideo = new this.videoModel({
      filename: file.filename,
      path: file.path,
      user: userId,
      createdAt: new Date(),
    });
    return newVideo.save();
  }
}