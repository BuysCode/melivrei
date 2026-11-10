import { Module } from '@nestjs/common';
import { BetterAuthGuard } from './better-auth.guard.js';

@Module({
  providers: [BetterAuthGuard],
  exports: [BetterAuthGuard],
})
export class AuthModule {}
