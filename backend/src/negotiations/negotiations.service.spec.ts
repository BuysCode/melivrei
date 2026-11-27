import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { validate } from 'class-validator';
import { PrismaService } from '../database/prisma.service.js';
import { UpdateContactDto } from './dto/update-contact.dto.js';
import { NegotiationsService } from './negotiations.service.js';

describe('Propostas e contato externo', () => {
  const listing = {
    id: 'listing',
    ownerId: 'seller',
    status: 'AVAILABLE',
    mode: 'SALE',
  };
  const approved = {
    status: 'APPROVED',
    listing: { ownerId: 'seller' },
    auditEvents: [{ actorId: 'seller', action: 'SALE_ACCEPTED' }],
  };
  const tx = {
    listing: { updateMany: jest.fn<() => Promise<{ count: number }>>() },
    negotiation: {
      create: jest.fn<() => Promise<object>>(),
      updateMany: jest.fn<() => Promise<{ count: number }>>(),
      findUniqueOrThrow: jest.fn<() => Promise<object>>(),
    },
    tradeOffer: { update: jest.fn<() => Promise<object>>() },
    auditEvent: { create: jest.fn<() => Promise<object>>() },
  };
  const prisma = {
    listing: { findUnique: jest.fn<() => Promise<object | null>>() },
    negotiation: {
      findUnique: jest.fn<() => Promise<object | null>>(),
      findFirst: jest.fn<() => Promise<object | null>>(),
    },
    user: {
      findUniqueOrThrow:
        jest.fn<() => Promise<{ whatsappNumber: string | null }>>(),
      update: jest.fn<() => Promise<object>>(),
    },
    $transaction: async (callback: (client: typeof tx) => Promise<unknown>) =>
      callback(tx),
  };
  const service = new NegotiationsService(prisma as unknown as PrismaService);

  beforeEach(() => {
    jest.resetAllMocks();
    prisma.listing.findUnique.mockResolvedValue(listing);
    prisma.user.findUniqueOrThrow.mockResolvedValue({
      whatsappNumber: '5551999999999',
    });
    prisma.negotiation.findUnique.mockResolvedValue({
      id: 'n1',
      listingId: 'listing',
      listing,
      type: 'SALE',
      status: 'PENDING',
      tradeOffer: null,
    });
    tx.listing.updateMany.mockResolvedValue({ count: 1 });
    tx.negotiation.updateMany.mockResolvedValue({ count: 1 });
    tx.negotiation.create.mockResolvedValue({ id: 'n1', status: 'PENDING' });
    tx.negotiation.findUniqueOrThrow.mockResolvedValue({
      id: 'n1',
      status: 'APPROVED',
    });
  });

  it('cria proposta de venda pendente e reserva sem depender de conta financeira', async () => {
    expect(await service.purchase('buyer', { listingId: 'listing' })).toEqual({
      id: 'n1',
      status: 'PENDING',
    });
    expect(tx.negotiation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'PENDING', type: 'SALE' }),
      }),
    );
    expect(tx.listing.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'RESERVED' } }),
    );
  });
  it('impede proposta de compra do próprio anúncio', async () => {
    await expect(
      service.purchase('seller', { listingId: 'listing' }),
    ).rejects.toThrow(BadRequestException);
    expect(tx.negotiation.create).not.toHaveBeenCalled();
  });
  it('impede duas propostas ativas de venda no mesmo anúncio', async () => {
    tx.listing.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.purchase('buyer', { listingId: 'listing' }),
    ).rejects.toThrow(BadRequestException);
    expect(tx.negotiation.create).not.toHaveBeenCalled();
  });
  it('somente o anunciante pode decidir, inclusive nas vendas', async () => {
    await expect(service.decide('buyer', 'n1', true)).rejects.toThrow(
      ForbiddenException,
    );
    expect(tx.negotiation.updateMany).not.toHaveBeenCalled();
  });
  it('aceite exige WhatsApp cadastrado', async () => {
    prisma.user.findUniqueOrThrow.mockResolvedValue({ whatsappNumber: null });
    await expect(service.decide('seller', 'n1', true)).rejects.toThrow(
      BadRequestException,
    );
    expect(tx.negotiation.updateMany).not.toHaveBeenCalled();
  });
  it('aceita venda com auditoria sem criar oferta de troca', async () => {
    await service.decide('seller', 'n1', true);
    expect(tx.auditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorId: 'seller',
          action: 'SALE_ACCEPTED',
        }),
      }),
    );
    expect(tx.tradeOffer.update).not.toHaveBeenCalled();
    expect(tx.listing.updateMany).not.toHaveBeenCalled();
  });
  it('recusa venda e libera anúncio mesmo sem WhatsApp', async () => {
    prisma.user.findUniqueOrThrow.mockResolvedValue({ whatsappNumber: null });
    await service.decide('seller', 'n1', false);
    expect(tx.listing.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['listing'] } },
      data: { status: 'AVAILABLE' },
    });
  });
  it('impede decisões concorrentes sem liberar anúncio nem repetir auditoria', async () => {
    tx.negotiation.updateMany.mockResolvedValue({ count: 0 });
    await expect(service.decide('seller', 'n1', false)).rejects.toThrow(
      ConflictException,
    );
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
    expect(tx.listing.updateMany).not.toHaveBeenCalled();
  });
  it.each(['APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'])(
    'não permite nova decisão no estado %s',
    async (status) => {
      prisma.negotiation.findUnique.mockResolvedValue({ listing, status });
      await expect(service.decide('seller', 'n1', true)).rejects.toThrow(
        BadRequestException,
      );
    },
  );
  it('preserva o aceite de troca e sua auditoria', async () => {
    prisma.negotiation.findUnique.mockResolvedValue({
      id: 'n1',
      listingId: 'listing',
      listing,
      type: 'TRADE',
      status: 'PENDING',
      tradeOffer: { offeredListingId: 'offered' },
    });
    await service.decide('seller', 'n1', true);
    expect(tx.tradeOffer.update).toHaveBeenCalledWith({
      where: { negotiationId: 'n1' },
      data: { status: 'ACCEPTED' },
    });
    expect(tx.auditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'TRADE_ACCEPTED' }),
      }),
    );
  });
  it('recusa troca e libera ambos os anúncios', async () => {
    prisma.negotiation.findUnique.mockResolvedValue({
      id: 'n1',
      listingId: 'listing',
      listing,
      type: 'TRADE',
      status: 'PENDING',
      tradeOffer: { offeredListingId: 'offered' },
    });
    await service.decide('seller', 'n1', false);
    expect(tx.listing.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['listing', 'offered'] } },
      data: { status: 'AVAILABLE' },
    });
  });
  it('oculta contato de terceiros e de IDs inexistentes', async () => {
    prisma.negotiation.findFirst.mockResolvedValue(null);
    await expect(
      service.contactForParticipant('outsider', 'n1'),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.negotiation.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'n1', participants: { some: { userId: 'outsider' } } },
      }),
    );
    expect(prisma.user.findUniqueOrThrow).not.toHaveBeenCalled();
  });
  it.each(['PENDING', 'REJECTED', 'CANCELLED', 'COMPLETED'])(
    'bloqueia contato no estado %s',
    async (status) => {
      prisma.negotiation.findFirst.mockResolvedValue({ ...approved, status });
      await expect(
        service.contactForParticipant('buyer', 'n1'),
      ).rejects.toThrow(ForbiddenException);
      expect(prisma.user.findUniqueOrThrow).not.toHaveBeenCalled();
    },
  );
  it('não confunde uma aprovação financeira legada com aceite', async () => {
    prisma.negotiation.findFirst.mockResolvedValue({
      ...approved,
      auditEvents: [],
    });
    await expect(service.contactForParticipant('buyer', 'n1')).rejects.toThrow(
      ForbiddenException,
    );
  });
  it('não libera contato com aceite registrado por outro usuário', async () => {
    prisma.negotiation.findFirst.mockResolvedValue({
      ...approved,
      auditEvents: [{ actorId: 'buyer' }],
    });
    await expect(service.contactForParticipant('buyer', 'n1')).rejects.toThrow(
      ForbiddenException,
    );
  });
  it('libera o WhatsApp correto somente após aceite', async () => {
    prisma.negotiation.findFirst.mockResolvedValue(approved);
    expect(await service.contactForParticipant('buyer', 'n1')).toEqual({
      url: 'https://wa.me/5551999999999',
    });
    await expect(service.contactForParticipant('seller', 'n1')).rejects.toThrow(
      ForbiddenException,
    );
  });
  it('informa indisponibilidade quando o contato legado ainda não foi cadastrado', async () => {
    prisma.negotiation.findFirst.mockResolvedValue(approved);
    prisma.user.findUniqueOrThrow.mockResolvedValue({ whatsappNumber: null });
    await expect(service.contactForParticipant('buyer', 'n1')).rejects.toThrow(
      NotFoundException,
    );
  });
  it('atualiza somente o contato da própria sessão', async () => {
    await service.updateContact('seller', '5551999999999');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'seller' },
      data: { whatsappNumber: '5551999999999' },
      select: { whatsappNumber: true },
    });
  });
  it('detalhes de negociação não consultam o telefone e sinalizam contato apenas após aceite', async () => {
    prisma.negotiation.findFirst.mockResolvedValue(approved);
    const result = await service.findOneForParticipant('buyer', 'n1');
    expect(result.canContact).toBe(true);
    expect(prisma.negotiation.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          listing: {
            include: {
              book: true,
              owner: { select: { id: true, name: true } },
            },
          },
        }),
      }),
    );
    expect(prisma.user.findUniqueOrThrow).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain('whatsappNumber');
    prisma.negotiation.findFirst.mockResolvedValue({
      ...approved,
      auditEvents: [],
    });
    expect(
      (await service.findOneForParticipant('buyer', 'n1')).canContact,
    ).toBe(false);
  });
  it.each([
    '',
    '+55 51 99999-9999',
    'https://example.com',
    '123',
    '0123456789',
    '1234567890123456',
  ])('recusa WhatsApp inválido: %s', async (whatsappNumber) => {
    expect(
      await validate(Object.assign(new UpdateContactDto(), { whatsappNumber })),
    ).not.toHaveLength(0);
  });
  it('valida WhatsApp em formato internacional', async () => {
    expect(
      await validate(
        Object.assign(new UpdateContactDto(), {
          whatsappNumber: '5551999999999',
        }),
      ),
    ).toHaveLength(0);
  });
});
