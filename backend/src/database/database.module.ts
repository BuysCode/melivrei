import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';

@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
/** Expõe globalmente a conexão Prisma com o banco de dados. */
export class DatabaseModule {}
