/* eslint-disable prettier/prettier */
// src/videos/videos.module.ts

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from '../videos/schemas/video.schema';
import { VideosService } from '../videos/videos.service';
import { VideoController } from './videos.controller';

@Module({
    imports: [MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }])],
    controllers: [VideoController],
    providers: [VideosService],
})
export class VideosModule { }