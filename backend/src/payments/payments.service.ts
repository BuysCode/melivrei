import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import {
  ListingStatus,
  NegotiationStatus,
  PaymentStatus,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service.js';
import { ProcessPaymentEventDto } from './dto/process-webhook.dto.js';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}
  async createForNegotiation(userId: string, negotiationId: string) {
    const negotiation = await this.prisma.negotiation.findUnique({
      where: { id: negotiationId },
      include: { listing: true, payment: true, participants: true },
    });
    if (!negotiation || negotiation.type !== 'SALE')
      throw new NotFoundException('Negociação de venda não encontrada.');
    if (
      !negotiation.participants.some(
        (participant) => participant.userId === userId,
      )
    )
      throw new NotFoundException('Negociação de venda não encontrada.');
    if (negotiation.payment) return negotiation.payment;
    if (!negotiation.listing.price)
      throw new BadRequestException('Anúncio sem preço.');
    return this.prisma.payment.create({
      data: {
        negotiationId,
        amount: negotiation.listing.price,
        providerPaymentId: `sandbox_${randomUUID()}`,
      },
    });
  }
  async processWebhook(dto: ProcessPaymentEventDto) {
    this.assertSignature(dto);
    const payment = await this.prisma.payment.findUnique({
      where: { id: dto.paymentId },
      include: { negotiation: true },
    });
    if (!payment) throw new NotFoundException('Pagamento não encontrado.');
    if (
      await this.prisma.paymentEvent.findUnique({
        where: { providerEventId: dto.providerEventId },
      })
    )
      return { processed: false, reason: 'Evento já processado.' };
    const status =
      dto.eventType === 'approved'
        ? PaymentStatus.APPROVED
        : dto.eventType === 'refused'
          ? PaymentStatus.REFUSED
          : PaymentStatus.EXPIRED;
    const negotiationStatus =
      status === PaymentStatus.APPROVED
        ? NegotiationStatus.APPROVED
        : NegotiationStatus.CANCELLED;
    await this.prisma.$transaction(async (tx) => {
      await tx.paymentEvent.create({
        data: {
          paymentId: payment.id,
          providerEventId: dto.providerEventId,
          eventType: dto.eventType,
          payloadHash: createHash('sha256')
            .update(JSON.stringify(dto))
            .digest('hex'),
          processedAt: new Date(),
        },
      });
      await tx.payment.update({ where: { id: payment.id }, data: { status } });
      await tx.negotiation.update({
        where: { id: payment.negotiationId },
        data: { status: negotiationStatus },
      });
      await tx.auditEvent.create({
        data: {
          negotiationId: payment.negotiationId,
          action: `PAYMENT_${status}`,
          entityType: 'Payment',
          entityId: payment.id,
        },
      });
      if (status !== PaymentStatus.APPROVED)
        await tx.listing.update({
          where: { id: payment.negotiation.listingId },
          data: { status: ListingStatus.AVAILABLE },
        });
    });
    return { processed: true, status };
  }
  private assertSignature(dto: ProcessPaymentEventDto) {
    const secret = this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
    const expected = createHash('sha256')
      .update(
        `${dto.paymentId}.${dto.providerEventId}.${dto.eventType}.${secret}`,
      )
      .digest('hex');
    const received = Buffer.from(dto.signature, 'utf8');
    const calculated = Buffer.from(expected, 'utf8');
    if (
      received.length !== calculated.length ||
      !timingSafeEqual(received, calculated)
    )
      throw new BadRequestException('Assinatura de webhook inválida.');
  }
}
