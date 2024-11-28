/* eslint-disable prettier/prettier */
// videos/videos.service.ts

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Video } from './schemas/video.schema'; // Định nghĩa schema của Video
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { CloudinaryService } from '@/configs/cloudinary/cloudinary.service';
import { Types } from 'mongoose';

@Injectable()
export class VideoService {
  constructor(
    @InjectModel('Video') private readonly videoModel: Model<Video>,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  async getVideosByUser(userId: string): Promise<string[]> {
    // Nếu userId là 'all', không cần chuyển đổi thành ObjectId
    const condition = userId === 'all' ? {} : { userId: new Types.ObjectId(userId) };
  
    const videos = await this.videoModel.find(condition).exec();
    console.log("Videos found:", videos); // Debug log
    return videos.map(video => video.cloudinaryUrl);
  }
  

  async getAllVideos(): Promise<string[]> {
    const videos = await this.videoModel.find().exec();
    console.log("All Videos found:", videos); // Debug log
    return videos.map(video => video.cloudinaryUrl);  // Trả về các URL video
  }
  
  async uploadVideo(userId: string, videoFile: Express.Multer.File) {
    // Tải video lên Cloudinary
    const uploadedResponse = await this.cloudinaryService.uploadVideo(videoFile.buffer, userId);

    // Lưu thông tin video vào cơ sở dữ liệu
    const newVideo = new this.videoModel({
      userId,                    // Lưu ID người dùng đã upload video
      cloudinaryId: uploadedResponse.public_id,  // Lưu public_id từ Cloudinary
      cloudinaryUrl: uploadedResponse.secure_url,  // Lưu URL của video
      videoUrl: uploadedResponse.secure_url,  // Thêm videoUrl vào để tránh lỗi validation
      title: 'Video Title',  // Thêm tiêu đề cho video nếu cần
    });

    // Lưu video mới vào cơ sở dữ liệu
    await newVideo.save();
    console.log("Video saved:", newVideo);

    // Trả về thông tin video đã upload
    return {
      videoUrl: uploadedResponse.secure_url,
      publicId: uploadedResponse.public_id,
    };
  }

  // Tăng lượt like
  async likeVideo(videoId: string, userId: string) {
    return this.videoModel.findByIdAndUpdate(
      videoId,
      { $addToSet: { likes: userId } },
      { new: true },
    );
  }

  // Tăng lượt share
  async shareVideo(videoId: string, userId: string) {
    return this.videoModel.findByIdAndUpdate(
      videoId,
      { $addToSet: { shares: userId } },
      { new: true },
    );
  }

  // Thêm bình luận
  async addComment(videoId: string, comment: { userId: string; content: string }) {
    return this.videoModel.findByIdAndUpdate(
      videoId,
      { $push: { comments: { ...comment, timestamp: new Date() } } },
      { new: true },
    );
  }
}
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException('Token is required');
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req['user'] = payload;
      next();
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}