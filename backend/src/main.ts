import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    rawBody: true,
  });
  app
    .getHttpAdapter()
    .getInstance()
    .all('/api/auth/*splat', toNodeHandler(auth));
  app.useBodyParser('json');
  app.useBodyParser('urlencoded', { extended: true });
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3001',
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const swagger = new DocumentBuilder()
    .setTitle('MeLivrei API')
    .setDescription('Marketplace de compra, venda e troca de livros usados.')
    .setVersion('1.0')
    .addCookieAuth('better-auth.session_token')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
