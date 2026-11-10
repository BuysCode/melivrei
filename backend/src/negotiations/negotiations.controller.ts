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
export class NegotiationsController {
  constructor(private readonly negotiations: NegotiationsService) {}
  @Post('purchases') @ApiOperation({ summary: 'Iniciar compra' }) purchase(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePurchaseDto,
  ) {
    return this.negotiations.purchase(user.id, dto);
  }
  @Post('trades') @ApiOperation({ summary: 'Propor troca' }) trade(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateTradeDto,
  ) {
    return this.negotiations.trade(user.id, dto);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Consultar negociação e histórico' })
  findOne(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.negotiations.findOneForParticipant(user.id, id);
  }
  @Patch(':id/accept')
  @ApiOperation({ summary: 'Aceitar proposta de troca' })
  accept(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.negotiations.decide(user.id, id, true);
  }
  @Patch(':id/reject')
  @ApiOperation({ summary: 'Recusar proposta de troca' })
  reject(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.negotiations.decide(user.id, id, false);
  }
}
