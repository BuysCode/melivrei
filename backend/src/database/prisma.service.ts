import {
  INestApplication,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client.js';
import { createPrismaAdapter } from './prisma-adapter.js';

@Injectable()
/** Gerencia o ciclo de vida da conexão Prisma dentro do NestJS. */
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({ adapter: createPrismaAdapter() });
  }

  /** Abre a conexão quando o módulo é inicializado. */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }
  /** Fecha a conexão quando a aplicação é encerrada. */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
  /** Fecha a aplicação NestJS antes de o processo Node.js finalizar. */
  async enableShutdownHooks(app: INestApplication): Promise<void> {
    process.once('beforeExit', () => void app.close());
  }
}
