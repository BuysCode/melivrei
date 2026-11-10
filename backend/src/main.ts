import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  // Preserve the unparsed body so Stripe's webhook signature can be verified.
  const app = await NestFactory.create(AppModule, { rawBody: true });
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
    .addBearerAuth()
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
