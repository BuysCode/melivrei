import { Controller, Delete, Get, Headers, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { BetterAuthGuard } from '../auth/better-auth.guard.js';
import { PaymentsService } from './payments.service.js';

@ApiTags('Pagamentos')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService, private readonly config: ConfigService) {}

  @Get()
  @UseGuards(BetterAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Consultar pagamentos das próprias negociações' })
  list(@CurrentUser() user: AuthenticatedUser) { return this.payments.listForUser(user.id); }

  @Post('negotiations/:id/checkout')
  @UseGuards(BetterAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Criar ou recuperar checkout da negociação de venda' })
  checkout(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.payments.createForParticipant(id, user.id);
  }

  @Get('mercadopago/connect')
  @UseGuards(BetterAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Iniciar vinculação OAuth do vendedor' })
  connect(@CurrentUser() user: AuthenticatedUser) { return this.payments.startConnection(user.id); }

  @Get('mercadopago/callback')
  @ApiOperation({ summary: 'Callback OAuth do Mercado Pago' })
  async callback(
    @Res() response: Response,
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('error') error?: string,
  ) {
    const result = await this.payments.completeConnection(code, state, error);
    const destination = new URL(result.redirectUrl, this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3001');
    destination.searchParams.set('mercado_pago', 'connected');
    return response.redirect(destination.toString());
  }

  @Get('mercadopago/connection')
  @UseGuards(BetterAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Consultar status da conta Mercado Pago vinculada' })
  connection(@CurrentUser() user: AuthenticatedUser) { return this.payments.connection(user.id); }

  @Delete('mercadopago/connection')
  @UseGuards(BetterAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Desvincular conta Mercado Pago localmente' })
  disconnect(@CurrentUser() user: AuthenticatedUser) { return this.payments.disconnect(user.id); }

  @Post('webhook')
  @ApiOperation({ summary: 'Processar notificação assinada do Mercado Pago' })
  webhook(
    @Req() request: Request & { rawBody?: Buffer },
    @Headers('x-signature') signature?: string,
    @Headers('x-request-id') requestId?: string,
    @Query('data.id') queryId?: string,
  ) {
    return this.payments.processWebhook(request.rawBody, signature, requestId, queryId);
  }
}
