import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './auth.js';
import { AppModule } from './app.module.js';

/**
 * Inicializa o servidor HTTP, a validação global, a autenticação e a
 * documentação interativa da API.
 *
 * @returns Uma promessa resolvida após o NestJS começar a escutar a porta configurada.
 */
async function bootstrap(): Promise<void> {
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
    .setDescription(
      'API do marketplace de compra, venda e troca de livros usados. ' +
        'Rotas protegidas exigem o cookie de sessão do Better Auth.',
    )
    .setVersion('1.0')
    .addServer('/api', 'Servidor atual')
    .addCookieAuth('better-auth.session_token', {
      type: 'apiKey',
      in: 'cookie',
      name: 'better-auth.session_token',
      description: 'Cookie de sessão emitido pelo Better Auth.',
    })
    .build();
  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
