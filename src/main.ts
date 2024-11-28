/* eslint-disable prettier/prettier */
// main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'; // Nhập các mô-đun Swagger

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  app.setGlobalPrefix('api/v1');

  // Bật CORS
  app.enableCors({
    origin: ['https://top-top.vercel.app', 'http://localhost:3000', 'http://192.168.1.22:3000', 'http://192.168.1.22:8080'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Cấu hình Swagger
  const swaggerConfig = new DocumentBuilder()
    .setTitle('API Documentation') // Tiêu đề cho tài liệu
    .setDescription('API description for your project') // Mô tả cho tài liệu
    .setVersion('1.0') // Phiên bản API
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document); // Thiết lập đường dẫn cho Swagger

  await app.listen(port, '0.0.0.0');
}
bootstrap();