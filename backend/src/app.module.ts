import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module.js';
import { DatabaseModule } from './database/database.module.js';
import { ListingsModule } from './listings/listings.module.js';
import { NegotiationsModule } from './negotiations/negotiations.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    ListingsModule,
    NegotiationsModule,
  ],
})
/** Raiz da composição dos módulos da aplicação MeLivrei. */
export class AppModule {}
