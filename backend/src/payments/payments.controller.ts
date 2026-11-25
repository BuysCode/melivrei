import {
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { BetterAuthGuard } from '../auth/better-auth.guard.js';
import { PaymentsService } from './payments.service.js';

@ApiTags('Pagamentos')
@Controller('payments')
/** Expõe o checkout, a vinculação OAuth e o webhook do Mercado Pago. */
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly config: ConfigService,
  ) {}

  @Get()
  @UseGuards(BetterAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Consultar pagamentos das próprias negociações' })
  /** Lista os pagamentos ligados às negociações da sessão. */
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.payments.listForUser(user.id);
  }

  @Post('negotiations/:id/checkout')
  @UseGuards(BetterAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({
    summary: 'Criar ou recuperar checkout da negociação de venda',
  })
  /** Prepara o checkout incorporado para o comprador participante. */
  checkout(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.payments.prepareBrick(id, user.id);
  }

  @Post('negotiations/:id/submit')
  @UseGuards(BetterAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Enviar os dados tokenizados do Payment Brick' })
  @ApiBody({
    description: 'Dados tokenizados emitidos pelo Mercado Pago Payment Brick.',
    schema: { type: 'object', additionalProperties: true },
  })
  /** Envia ao serviço somente os dados tokenizados retornados pelo Payment Brick. */
  submitBrick(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Req() request: Request,
  ) {
    return this.payments.submitBrick(
      id,
      user.id,
      request.body as Record<string, unknown>,
    );
  }

  @Get('negotiations/:id/pix')
  @UseGuards(BetterAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Consultar o código Pix do pagamento pendente' })
  /** Consulta os dados Pix de um pagamento iniciado pela sessão. */
  pix(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.payments.pixForParticipant(id, user.id);
  }

  @Get('mercadopago/connect')
  @UseGuards(BetterAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Iniciar vinculação OAuth do vendedor' })
  /** Inicia a autorização OAuth da conta Mercado Pago do vendedor. */
  connect(@CurrentUser() user: AuthenticatedUser) {
    return this.payments.startConnection(user.id);
  }

  @Get('mercadopago/callback')
  @ApiOperation({ summary: 'Callback OAuth do Mercado Pago' })
  /** Processa o retorno OAuth e redireciona o usuário ao frontend. */
  async callback(
    @Res() response: Response,
    @Query('code') code?: string,
    @Query('state') state?: string,
    @Query('error') error?: string,
  ) {
    const result = await this.payments.completeConnection(code, state, error);
    const destination = new URL(
      result.redirectUrl,
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3001',
    );
    destination.searchParams.set('mercado_pago', 'connected');
    return response.redirect(destination.toString());
  }

  @Get('mercadopago/connection')
  @UseGuards(BetterAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Consultar status da conta Mercado Pago vinculada' })
  /** Retorna o estado da conta Mercado Pago da sessão, sem expor tokens. */
  connection(@CurrentUser() user: AuthenticatedUser) {
    return this.payments.connection(user.id);
  }

  @Delete('mercadopago/connection')
  @UseGuards(BetterAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Desvincular conta Mercado Pago localmente' })
  /** Remove o vínculo local da conta Mercado Pago da sessão. */
  disconnect(@CurrentUser() user: AuthenticatedUser) {
    return this.payments.disconnect(user.id);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Processar notificação assinada do Mercado Pago' })
  /** Recebe uma notificação assinada e a valida antes de alterar o pagamento. */
  webhook(
    @Req() request: Request & { rawBody?: Buffer },
    @Headers('x-signature') signature?: string,
    @Headers('x-request-id') requestId?: string,
    @Query('data.id') queryId?: string,
  ) {
    return this.payments.processWebhook(
      request.rawBody,
      signature,
      requestId,
      queryId,
    );
  }
}
