import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { MercadoPagoGateway } from './mercado-pago.gateway.js';
import { PaymentGateway } from './payment-gateway.js';
@Module({
  imports: [AuthModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    MercadoPagoGateway,
    { provide: PaymentGateway, useExisting: MercadoPagoGateway },
  ],
  exports: [PaymentsService],
})
/** Agrupa a integração de pagamentos e o gateway Mercado Pago. */
export class PaymentsModule {}
