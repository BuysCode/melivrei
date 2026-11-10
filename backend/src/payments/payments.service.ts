import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import {
  ListingStatus,
  NegotiationStatus,
  PaymentStatus,
} from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.stripe = new Stripe(
      this.config.getOrThrow<string>('STRIPE_SECRET_KEY'),
    );
  }

  async createForNegotiation(negotiationId: string) {
    const negotiation = await this.prisma.negotiation.findUnique({
      where: { id: negotiationId },
      include: { listing: true, payment: true },
    });
    if (!negotiation || negotiation.type !== 'SALE')
      throw new NotFoundException('Negociação de venda não encontrada.');
    if (!negotiation.listing.price)
      throw new BadRequestException('Anúncio sem preço.');

    if (negotiation.payment) {
      const intent = await this.stripe.paymentIntents.retrieve(
        negotiation.payment.providerPaymentId,
      );
      return { ...negotiation.payment, clientSecret: intent.client_secret };
    }

    const intent = await this.createPaymentIntent(
      negotiation.id,
      negotiation.listing.price,
    );
    let payment;
    try {
      payment = await this.prisma.payment.create({
        data: {
          negotiationId,
          amount: negotiation.listing.price,
          providerPaymentId: intent.id,
        },
      });
    } catch (error) {
      const existingPayment = await this.prisma.payment.findUnique({
        where: { negotiationId },
      });
      if (!existingPayment) {
        await this.stripe.paymentIntents.cancel(intent.id);
        throw error;
      }
      payment = existingPayment;
    }

    return {
      ...payment,
      clientSecret: intent.client_secret,
    };
  }

  async processWebhook(
    payload: Buffer | undefined,
    signature: string | undefined,
  ) {
    if (!payload || !signature)
      throw new BadRequestException('Assinatura do Stripe ausente.');
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET'),
      );
    } catch {
      throw new BadRequestException('Assinatura de webhook inválida.');
    }
    if (
      ![
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
        'payment_intent.canceled',
      ].includes(event.type)
    )
      return { processed: false, reason: 'Evento ignorado.' };

    const intent = event.data.object as Stripe.PaymentIntent;
    const negotiationId = intent.metadata.negotiationId;
    if (!negotiationId)
      throw new BadRequestException(
        'PaymentIntent sem referência de negociação.',
      );
    const payment = await this.prisma.payment.findUnique({
      where: { negotiationId },
      include: { negotiation: true },
    });
    if (!payment) throw new NotFoundException('Pagamento não encontrado.');
    if (
      await this.prisma.paymentEvent.findUnique({
        where: { providerEventId: event.id },
      })
    )
      return { processed: false, reason: 'Evento já processado.' };
    const status =
      event.type === 'payment_intent.succeeded'
        ? PaymentStatus.APPROVED
        : event.type === 'payment_intent.payment_failed'
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
          providerEventId: event.id,
          eventType: event.type,
          payloadHash: createHash('sha256')
            .update(JSON.stringify(event))
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

  private createPaymentIntent(negotiationId: string, amount: unknown) {
    const amountInCents = Math.round(Number(amount) * 100);
    if (!Number.isSafeInteger(amountInCents) || amountInCents < 50)
      throw new BadRequestException(
        'Valor do anúncio inválido para pagamento.',
      );
    return this.stripe.paymentIntents.create(
      {
        amount: amountInCents,
        currency: 'brl',
        automatic_payment_methods: { enabled: true },
        metadata: { negotiationId },
      },
      { idempotencyKey: `negotiation-${negotiationId}` },
    );
  }
}
