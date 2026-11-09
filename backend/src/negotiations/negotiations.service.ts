import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import {
  ListingMode,
  ListingStatus,
  NegotiationStatus,
  NegotiationType,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service.js';
import {
  CreatePurchaseDto,
  CreateTradeDto,
} from './dto/create-negotiation.dto.js';

@Injectable()
export class NegotiationsService {
  constructor(private readonly prisma: PrismaService) {}
  async purchase(buyerId: string, dto: CreatePurchaseDto) {
    const listing = await this.availableListing(
      dto.listingId,
      ListingMode.SALE,
    );
    if (listing.ownerId === buyerId)
      throw new BadRequestException('Você não pode comprar o próprio anúncio.');
    const negotiation = await this.prisma.$transaction(async (tx) => {
      const current = await tx.listing.findUniqueOrThrow({
        where: { id: listing.id },
      });
      if (current.status !== ListingStatus.AVAILABLE)
        throw new BadRequestException('Anúncio indisponível.');
      await tx.listing.update({
        where: { id: listing.id },
        data: { status: ListingStatus.RESERVED },
      });
      return tx.negotiation.create({
        data: {
          listingId: listing.id,
          type: NegotiationType.SALE,
          status: NegotiationStatus.PENDING_PAYMENT,
          participants: {
            create: [{ userId: buyerId }, { userId: listing.ownerId }],
          },
          payment: {
            create: {
              amount: listing.price!,
              providerPaymentId: `sandbox_${randomUUID()}`,
            },
          },
          auditEvents: {
            create: {
              actorId: buyerId,
              action: 'PURCHASE_STARTED',
              entityType: 'Negotiation',
              entityId: listing.id,
            },
          },
        },
        include: { payment: true },
      });
    });
    return negotiation;
  }
  async trade(requesterId: string, dto: CreateTradeDto) {
    if (dto.listingId === dto.offeredListingId)
      throw new BadRequestException('Os anúncios devem ser distintos.');
    const requested = await this.availableListing(
      dto.listingId,
      ListingMode.TRADE,
    );
    const offered = await this.availableListing(dto.offeredListingId);
    if (requested.ownerId === requesterId || offered.ownerId !== requesterId)
      throw new ForbiddenException(
        'A troca deve envolver um anúncio próprio e outro usuário.',
      );
    return this.prisma.$transaction(async (tx) => {
      await tx.listing.updateMany({
        where: {
          id: { in: [requested.id, offered.id] },
          status: ListingStatus.AVAILABLE,
        },
        data: { status: ListingStatus.IN_NEGOTIATION },
      });
      return tx.negotiation.create({
        data: {
          listingId: requested.id,
          type: NegotiationType.TRADE,
          participants: {
            create: [{ userId: requesterId }, { userId: requested.ownerId }],
          },
          tradeOffer: {
            create: { offeredListingId: offered.id, message: dto.message },
          },
          auditEvents: {
            create: {
              actorId: requesterId,
              action: 'TRADE_PROPOSED',
              entityType: 'Negotiation',
              entityId: requested.id,
            },
          },
        },
        include: { tradeOffer: true },
      });
    });
  }
  async decide(ownerId: string, id: string, accept: boolean) {
    const negotiation = await this.prisma.negotiation.findUnique({
      where: { id },
      include: { listing: true, tradeOffer: true, participants: true },
    });
    if (!negotiation) throw new NotFoundException('Negociação não encontrada.');
    if (negotiation.listing.ownerId !== ownerId)
      throw new ForbiddenException(
        'Somente o proprietário pode decidir a proposta.',
      );
    if (
      negotiation.type !== NegotiationType.TRADE ||
      !negotiation.tradeOffer ||
      negotiation.status !== NegotiationStatus.PENDING
    )
      throw new BadRequestException('Esta negociação não pode ser decidida.');
    const offeredListingId = negotiation.tradeOffer.offeredListingId;
    return this.prisma.$transaction(async (tx) => {
      await tx.tradeOffer.update({
        where: { negotiationId: id },
        data: { status: accept ? 'ACCEPTED' : 'REJECTED' },
      });
      await tx.auditEvent.create({
        data: {
          actorId: ownerId,
          negotiationId: id,
          action: accept ? 'TRADE_ACCEPTED' : 'TRADE_REJECTED',
          entityType: 'Negotiation',
          entityId: id,
        },
      });
      if (accept)
        return tx.negotiation.update({
          where: { id },
          data: { status: NegotiationStatus.APPROVED },
        });
      await tx.listing.updateMany({
        where: { id: { in: [negotiation.listingId, offeredListingId] } },
        data: { status: ListingStatus.AVAILABLE },
      });
      return tx.negotiation.update({
        where: { id },
        data: { status: NegotiationStatus.REJECTED },
      });
    });
  }
  async findOneForParticipant(userId: string, id: string) {
    const negotiation = await this.prisma.negotiation.findFirst({
      where: { id, participants: { some: { userId } } },
      include: {
        listing: { include: { book: true } },
        tradeOffer: true,
        payment: true,
        auditEvents: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!negotiation) throw new NotFoundException('Negociação não encontrada.');
    return negotiation;
  }
  private async availableListing(id: string, mode?: ListingMode) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (
      !listing ||
      listing.status !== ListingStatus.AVAILABLE ||
      (mode && listing.mode !== mode)
    )
      throw new NotFoundException('Anúncio disponível não encontrado.');
    return listing;
  }
}
