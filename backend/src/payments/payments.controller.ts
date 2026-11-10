import { Controller, Headers, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service.js';
@ApiTags('Pagamentos')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}
  @Post('webhook')
  @ApiOperation({ summary: 'Processar evento de pagamento assinado' })
  webhook(
    @Req() request: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature?: string,
  ) {
    return this.payments.processWebhook(request.rawBody, signature);
  }
}
