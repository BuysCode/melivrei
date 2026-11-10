import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ListingStatus, Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';
import { CreateListingDto } from './dto/create-listing.dto.js';
import { ListListingsDto } from './dto/list-listings.dto.js';

const listingInclude = {
  book: true,
  images: true,
  owner: { select: { id: true, name: true } },
} satisfies Prisma.ListingInclude;

@Injectable()
export class ListingsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(ownerId: string, dto: CreateListingDto) {
    if (dto.mode === 'SALE' && dto.price === undefined)
      throw new BadRequestException(
        'Preço é obrigatório para anúncios de venda.',
      );
    return this.prisma.listing.create({
      data: {
        owner: { connect: { id: ownerId } },
        description: dto.description,
        condition: dto.condition,
        mode: dto.mode,
        price: dto.price,
        book: {
          create: {
            title: dto.title,
            author: dto.author,
            isbn: dto.isbn,
            genre: dto.genre,
          },
        },
        images: {
          create: dto.images?.map((image) => ({
            url: image.url,
            altText: image.altText,
          })),
        },
      },
      include: listingInclude,
    });
  }
  findAvailable(query: ListListingsDto) {
    const search = query.search?.trim();
    return this.prisma.listing.findMany({
      where: {
        status: ListingStatus.AVAILABLE,
        mode: query.mode,
        ...(search
          ? {
              OR: [
                { book: { title: { contains: search, mode: 'insensitive' } } },
                { book: { author: { contains: search, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: listingInclude,
      orderBy: { createdAt: 'desc' },
    });
  }
  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: listingInclude,
    });
    if (!listing) throw new NotFoundException('Anúncio não encontrado.');
    return listing;
  }
  async remove(id: string, ownerId: string) {
    const listing = await this.findOne(id);
    if (listing.ownerId !== ownerId)
      throw new ForbiddenException('Você não pode remover este anúncio.');
    if (
      listing.status === ListingStatus.IN_NEGOTIATION ||
      listing.status === ListingStatus.RESERVED
    )
      throw new BadRequestException(
        'Anúncios com negociação ativa não podem ser removidos.',
      );
    return this.prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.CANCELLED },
    });
  }
}
