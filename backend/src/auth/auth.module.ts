import { Module } from '@nestjs/common';
import { BetterAuthGuard } from './better-auth.guard.js';

@Module({
  providers: [BetterAuthGuard],
  exports: [BetterAuthGuard],
})
/** Disponibiliza os componentes de autenticação e autorização da aplicação. */
export class AuthModule {}
