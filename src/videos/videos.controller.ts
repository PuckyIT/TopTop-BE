/* eslint-disable prettier/prettier */
// videos/videos.controller.ts

import { Controller, Get, Post, Body, Param, UseGuards, UseInterceptors, Req, UploadedFile } from '@nestjs/common';
import { VideoService } from './videos.service';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('videos')
export class VideoController {
  constructor(private readonly videoService: VideoService) { }

  // API trả về video của người dùng
  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  async getVideosByUser(@Param('userId') userId: string) {
    console.log("User ID:", userId);
    const videoUrls = await this.videoService.getVideosByUser(userId);
    return { videoUrls };
  }
  
  @UseGuards(JwtAuthGuard)  // Bảo vệ bằng JWT token
  @Get('all')  // Định nghĩa đường dẫn lấy tất cả video
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getAllVideos(@Req() req) {
    const videoUrls = await this.videoService.getAllVideos();
    return { videoUrls };
  }
  

  @UseGuards(JwtAuthGuard)
  @Post('upload-video')
  @UseInterceptors(FileInterceptor('video'))  // Dùng FileInterceptor để xử lý video
  async uploadVideo(
    @Req() req,  // Lấy thông tin người dùng từ request
    @UploadedFile() videoFile: Express.Multer.File,  // Video tải lên
  ) {
    const userId = req.user.id;  // Lấy userId từ JWT token
    return this.videoService.uploadVideo(userId, videoFile);  // Xử lý upload video trong VideoService
  }

  // Tăng lượt like
  @Post('/:videoId/like')
  async likeVideo(@Param('videoId') videoId: string, @Body('userId') userId: string) {
    return this.videoService.likeVideo(videoId, userId);
  }

  // Tăng lượt share
  @Post('/:videoId/share')
  async shareVideo(@Param('videoId') videoId: string, @Body('userId') userId: string) {
    return this.videoService.shareVideo(videoId, userId);
  }

  // Thêm bình luận
  @Post('/:videoId/comment')
  async addComment(
    @Param('videoId') videoId: string,
    @Body() comment: { userId: string; content: string },
  ) {
    return this.videoService.addComment(videoId, comment);
  }
}