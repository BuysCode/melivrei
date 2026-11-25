import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/current-user.decorator.js';
import { BetterAuthGuard } from '../auth/better-auth.guard.js';
import { CreateListingDto } from './dto/create-listing.dto.js';
import { ListListingsDto } from './dto/list-listings.dto.js';
import { ListingsService } from './listings.service.js';

@ApiTags('Anúncios')
@Controller('listings')
/** Expõe as rotas HTTP do catálogo e da gestão de anúncios. */
export class ListingsController {
  constructor(private readonly listings: ListingsService) {}
  @Get()
  @ApiOperation({ summary: 'Listar anúncios disponíveis' })
  @ApiOkResponse({ description: 'Catálogo público.' })
  /** Lista anúncios disponíveis para visitantes e usuários autenticados. */
  findAll(@Query() query: ListListingsDto) {
    return this.listings.findAvailable(query);
  }
  @Get('mine')
  @UseGuards(BetterAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Listar anúncios do usuário autenticado' })
  /** Lista os anúncios pertencentes à sessão autenticada. */
  findMine(@CurrentUser() user: AuthenticatedUser) {
    return this.listings.findMine(user.id);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Consultar anúncio' })
  /** Consulta os detalhes de um anúncio. */ findOne(@Param('id') id: string) {
    return this.listings.findOne(id);
  }
  @Post()
  @UseGuards(BetterAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Publicar anúncio' })
  @ApiCreatedResponse({ description: 'Anúncio publicado.' })
  /** Publica um anúncio em nome do usuário autenticado. */
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateListingDto,
  ) {
    return this.listings.create(user.id, dto);
  }
  @Delete(':id')
  @UseGuards(BetterAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Cancelar anúncio próprio' })
  /** Cancela um anúncio pertencente ao usuário autenticado. */
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.listings.remove(id, user.id);
  }
}
