import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { ProcessPaymentEventDto } from './dto/process-webhook.dto.js';
import { PaymentsService } from './payments.service.js';
@ApiTags('Pagamentos')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}
  @Post('negotiations/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar pagamento de venda no sandbox' })
  create(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.payments.createForNegotiation(user.id, id);
  }
  @Post('webhook')
  @ApiOperation({ summary: 'Processar evento de pagamento assinado' })
  webhook(@Body() dto: ProcessPaymentEventDto) {
    return this.payments.processWebhook(dto);
  }
}
