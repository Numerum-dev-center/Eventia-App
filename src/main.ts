const crypto = require('crypto');
if (!(global as any).crypto) {
  (global as any).crypto = crypto;
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);

  // --- Configuration Swagger ---
  const config = new DocumentBuilder()
    .setTitle('API de Eventia')
    .setDescription('La documentation de notre  API')
    .setVersion('1.0')
    .addTag('users') // Optionnel : pour organiser par tags
    .build();
    
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document); // L'UI sera accessible sur /api-docs
  // -----------------------------

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,  }),
  );

  async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser()); // Active la lecture des cookies
  await app.listen(3000);
}

  app.enableCors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Nécessaire si tu utilises des cookies ou sessions
    allowedHeaders: 'Content-Type, Authorization',
    exposedHeaders: 'Authorization', // Utile si tu exposes des headers custom
  });
}
bootstrap();
