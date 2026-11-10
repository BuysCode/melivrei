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
export class ListingsController {
  constructor(private readonly listings: ListingsService) {}
  @Get()
  @ApiOperation({ summary: 'Listar anúncios disponíveis' })
  @ApiOkResponse({ description: 'Catálogo público.' })
  findAll(@Query() query: ListListingsDto) {
    return this.listings.findAvailable(query);
  }
  @Get(':id') @ApiOperation({ summary: 'Consultar anúncio' }) findOne(
    @Param('id') id: string,
  ) {
    return this.listings.findOne(id);
  }
  @Post()
  @UseGuards(BetterAuthGuard)
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Publicar anúncio' })
  @ApiCreatedResponse({ description: 'Anúncio publicado.' })
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
  remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.listings.remove(id, user.id);
  }
}
