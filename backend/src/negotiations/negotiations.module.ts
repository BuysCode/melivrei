import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PaymentsModule } from '../payments/payments.module.js';
import { NegotiationsController } from './negotiations.controller.js';
import { NegotiationsService } from './negotiations.service.js';
@Module({
  imports: [AuthModule, PaymentsModule],
  controllers: [NegotiationsController],
  providers: [NegotiationsService],
})
/** Agrupa os fluxos de compra, troca e decisão de propostas. */
export class NegotiationsModule {}
