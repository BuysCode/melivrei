import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ListingMode,
  ListingStatus,
  NegotiationStatus,
  NegotiationType,
} from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';
import {
  CreatePurchaseDto,
  CreateTradeDto,
} from './dto/create-negotiation.dto.js';

@Injectable()
/** Centraliza as regras transacionais para compras e propostas de troca. */
export class NegotiationsService {
  constructor(private readonly prisma: PrismaService) {}
  /**
   * Reserva um anúncio de venda e cria a negociação de compra.
   *
   * @throws {BadRequestException} Quando o comprador tenta comprar o próprio anúncio ou ele já não está disponível.
   */
  async purchase(buyerId: string, dto: CreatePurchaseDto) {
    const listing = await this.availableListing(
      dto.listingId,
      ListingMode.SALE,
    );
    if (listing.ownerId === buyerId)
      throw new BadRequestException('Você não pode comprar o próprio anúncio.');
    const negotiation = await this.prisma.$transaction(async (tx) => {
      const reservation = await tx.listing.updateMany({
        where: { id: listing.id, status: ListingStatus.AVAILABLE },
        data: { status: ListingStatus.RESERVED },
      });
      if (reservation.count === 0)
        throw new BadRequestException('Anúncio indisponível.');
      return tx.negotiation.create({
        data: {
          listingId: listing.id,
          type: NegotiationType.SALE,
          status: NegotiationStatus.PENDING,
          participants: {
            create: [{ userId: buyerId }, { userId: listing.ownerId }],
          },
          auditEvents: {
            create: {
              actorId: buyerId,
              action: 'SALE_PROPOSED',
              entityType: 'Negotiation',
              entityId: listing.id,
            },
          },
        },
      });
    });
    return negotiation;
  }
  /**
   * Cria uma proposta de troca e marca ambos os anúncios como em negociação.
   *
   * @throws {ForbiddenException} Quando a oferta não envolve um anúncio próprio e outro de terceiro.
   */
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
  /**
   * Aceita ou recusa uma proposta de venda ou troca como proprietário.
   *
   * @throws {ForbiddenException} Quando quem decide não é o proprietário.
   */
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
    if (negotiation.status !== NegotiationStatus.PENDING)
      throw new BadRequestException('Esta negociação não pode ser decidida.');
    if (accept) {
      const owner = await this.contactProfile(ownerId);
      if (!owner.whatsappNumber)
        throw new BadRequestException(
          'Cadastre seu WhatsApp em Minha conta antes de aceitar uma proposta.',
        );
    }
    return this.prisma.$transaction(async (tx) => {
      const decision = await tx.negotiation.updateMany({
        where: { id, status: NegotiationStatus.PENDING },
        data: {
          status: accept
            ? NegotiationStatus.APPROVED
            : NegotiationStatus.REJECTED,
        },
      });
      if (decision.count !== 1)
        throw new ConflictException('Esta proposta já foi respondida.');
      if (negotiation.tradeOffer)
        await tx.tradeOffer.update({
          where: { negotiationId: id },
          data: { status: accept ? 'ACCEPTED' : 'REJECTED' },
        });
      await tx.auditEvent.create({
        data: {
          actorId: ownerId,
          negotiationId: id,
          action: `${negotiation.type}_${accept ? 'ACCEPTED' : 'REJECTED'}`,
          entityType: 'Negotiation',
          entityId: id,
        },
      });
      if (!accept)
        await tx.listing.updateMany({
          where: {
            id: {
              in: [
                negotiation.listingId,
                ...(negotiation.tradeOffer
                  ? [negotiation.tradeOffer.offeredListingId]
                  : []),
              ],
            },
          },
          data: { status: ListingStatus.AVAILABLE },
        });
      return tx.negotiation.findUniqueOrThrow({ where: { id } });
    });
  }
  /** Lista propostas de venda e troca das quais o usuário participa. */
  listPurchases(userId: string) {
    return this.prisma.negotiation.findMany({
      where: { participants: { some: { userId } } },
      select: {
        id: true,
        type: true,
        status: true,
        listing: {
          select: { ownerId: true, book: { select: { title: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Retorna uma negociação apenas para um de seus participantes.
   *
   * @throws {NotFoundException} Quando a negociação não existe ou não pertence ao usuário.
   */
  async findOneForParticipant(userId: string, id: string) {
    const negotiation = await this.prisma.negotiation.findFirst({
      where: { id, participants: { some: { userId } } },
      include: {
        listing: {
          include: { book: true, owner: { select: { id: true, name: true } } },
        },
        tradeOffer: {
          include: {
            offeredListing: {
              include: {
                book: true,
                owner: { select: { id: true, name: true } },
              },
            },
          },
        },
        auditEvents: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!negotiation) throw new NotFoundException('Negociação não encontrada.');
    return {
      ...negotiation,
      canContact:
        negotiation.status === NegotiationStatus.APPROVED &&
        negotiation.listing.ownerId !== userId &&
        negotiation.auditEvents.some(
          (event) =>
            event.actorId === negotiation.listing.ownerId &&
            ['SALE_ACCEPTED', 'TRADE_ACCEPTED'].includes(event.action),
        ),
    };
  }

  /** Consulta somente o contato da própria sessão. Não é exposto pelo catálogo. */
  async contactProfile(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { whatsappNumber: true },
    });
  }

  /** Atualiza o contato da própria sessão sem modificar autenticação ou anúncios. */
  updateContact(userId: string, whatsappNumber: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { whatsappNumber },
      select: { whatsappNumber: true },
    });
  }

  /** Libera o WhatsApp do anunciante apenas ao interessado após aceite explícito. */
  async contactForParticipant(userId: string, id: string) {
    const negotiation = await this.prisma.negotiation.findFirst({
      where: { id, participants: { some: { userId } } },
      select: {
        status: true,
        listing: { select: { ownerId: true } },
        auditEvents: {
          where: { action: { in: ['SALE_ACCEPTED', 'TRADE_ACCEPTED'] } },
          select: { actorId: true },
        },
      },
    });
    if (!negotiation) throw new NotFoundException('Negociação não encontrada.');
    if (
      negotiation.listing.ownerId === userId ||
      negotiation.status !== NegotiationStatus.APPROVED ||
      !negotiation.auditEvents.some(
        (event) => event.actorId === negotiation.listing.ownerId,
      )
    )
      throw new ForbiddenException(
        'Contato disponível somente ao interessado após o aceite do anunciante.',
      );
    const owner = await this.contactProfile(negotiation.listing.ownerId);
    if (!owner.whatsappNumber)
      throw new NotFoundException(
        'O anunciante ainda não cadastrou seu WhatsApp.',
      );
    return { url: `https://wa.me/${owner.whatsappNumber}` };
  }
  /** Busca um anúncio disponível e, se informado, compatível com a modalidade. */
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
