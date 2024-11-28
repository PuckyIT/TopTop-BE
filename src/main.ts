/* eslint-disable prettier/prettier */
// main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const expressApp = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }));
    app.setGlobalPrefix('api/v1');

    app.enableCors({
      origin: ['https://top-top.vercel.app', 'http://localhost:3000', 'http://192.168.1.22:3000', 'http://192.168.1.22:8080'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    });

    const swaggerConfig = new DocumentBuilder()
      .setTitle('API Documentation')
      .setDescription('API description for your project')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);

    await app.init();
    cachedApp = expressApp;
  }
  return cachedApp;
}

export default async (req: any, res: any) => {
  const app = await bootstrap();
  app(req, res);
};