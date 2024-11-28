/* eslint-disable prettier/prettier */
// src/videos/videos.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VideoController } from './videos.controller';
import { VideoService } from './videos.service';
import { VideoSchema } from './schemas/video.schema';
import { CloudinaryModule } from '../configs/cloudinary';

@Module({
    imports: [
        CloudinaryModule, MongooseModule.forFeature([{ name: 'Video', schema: VideoSchema }]),
    ],
    controllers: [VideoController],
    providers: [VideoService],
})
export class VideoModule { }