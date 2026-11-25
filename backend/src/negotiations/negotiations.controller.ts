import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { BetterAuthGuard } from '../auth/better-auth.guard.js';
import {
  CreatePurchaseDto,
  CreateTradeDto,
} from './dto/create-negotiation.dto.js';
import { NegotiationsService } from './negotiations.service.js';
@ApiTags('Negociações')
@ApiCookieAuth()
@UseGuards(BetterAuthGuard)
@Controller('negotiations')
/** Expõe os fluxos autenticados de compra e troca de anúncios. */
export class NegotiationsController {
  constructor(private readonly negotiations: NegotiationsService) {}
  @Post('purchases')
  @ApiOperation({ summary: 'Iniciar compra' })
  /** Inicia uma negociação de venda para o comprador autenticado. */ purchase(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePurchaseDto,
  ) {
    return this.negotiations.purchase(user.id, dto);
  }
  @Post('trades')
  @ApiOperation({ summary: 'Propor troca' })
  /** Cria uma proposta de troca entre anúncios. */ trade(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTradeDto,
  ) {
    return this.negotiations.trade(user.id, dto);
  }
  @Get('purchases')
  @ApiOperation({ summary: 'Listar compras e vendas do participante' })
  /** Lista as compras e vendas das quais a sessão participa. */
  listPurchases(@CurrentUser() user: AuthenticatedUser) {
    return this.negotiations.listPurchases(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar negociação e histórico' })
  /** Retorna uma negociação e seus eventos de auditoria. */
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.negotiations.findOneForParticipant(user.id, id);
  }
  @Patch(':id/accept')
  @ApiOperation({ summary: 'Aceitar proposta de troca' })
  /** Aceita uma proposta de troca como proprietário do anúncio solicitado. */
  accept(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.negotiations.decide(user.id, id, true);
  }
  @Patch(':id/reject')
  @ApiOperation({ summary: 'Recusar proposta de troca' })
  /** Recusa uma proposta de troca como proprietário do anúncio solicitado. */
  reject(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.negotiations.decide(user.id, id, false);
  }
}
