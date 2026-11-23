import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import {
  ListingStatus,
  NegotiationStatus,
  PaymentStatus,
} from '../generated/prisma/client.js';
import { PrismaService } from '../database/prisma.service.js';
import { PaymentGateway } from './payment-gateway.js';
import type { MpToken } from './mercado-pago.gateway.js';

type MpWebhook = {
  id?: string | number;
  type?: string;
  action?: string;
  user_id?: number | string;
  data?: { id?: string | number };
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly mercadoPago: PaymentGateway,
  ) {}

  async assertSellerCanReceive(userId: string) {
    if (!this.splitEnabled())
      throw new ServiceUnavailableException('Checkout bloqueado: split do marketplace não está habilitado.');
    const account = await this.prisma.sellerPaymentAccount.findUnique({ where: { userId } });
    if (!account || account.status !== 'ACTIVE')
      throw new ConflictException('O vendedor precisa vincular uma conta Mercado Pago ativa.');
  }

  async startConnection(userId: string) {
    const state = randomBytes(32).toString('base64url');
    await this.prisma.mercadoPagoOAuthState.create({
      data: {
        userId,
        stateHash: this.hash(state),
        expiresAt: new Date(Date.now() + 10 * 60_000),
      },
    });
    return { authorizationUrl: this.mercadoPago.authorizationUrl(state) };
  }

  async completeConnection(code?: string, state?: string, providerError?: string) {
    if (providerError) throw new BadRequestException('Autorização Mercado Pago recusada.');
    if (!code || !state) throw new BadRequestException('Callback OAuth incompleto.');
    const oauthState = await this.prisma.mercadoPagoOAuthState.findUnique({ where: { stateHash: this.hash(state) } });
    if (!oauthState || oauthState.consumedAt || oauthState.expiresAt <= new Date())
      throw new ForbiddenException('Estado OAuth inválido ou expirado.');
    const claimed = await this.prisma.mercadoPagoOAuthState.updateMany({
      where: { id: oauthState.id, consumedAt: null, expiresAt: { gt: new Date() } },
      data: { consumedAt: new Date() },
    });
    if (claimed.count !== 1) throw new ForbiddenException('Estado OAuth já utilizado.');

    const tokens = await this.mercadoPago.exchangeCode(code);
    await this.saveSellerAccount(oauthState.userId, tokens);
    return {
      connected: true,
      redirectUrl: this.config.get<string>('MERCADO_PAGO_CONNECTION_RETURN_URL') ?? this.config.get<string>('FRONTEND_URL') ?? '/',
    };
  }

  async connection(userId: string) {
    const account = await this.prisma.sellerPaymentAccount.findUnique({ where: { userId } });
    return account
      ? { connected: account.status === 'ACTIVE', providerUserId: account.providerUserId, status: account.status, linkedAt: account.createdAt }
      : { connected: false, status: 'NOT_CONNECTED' };
  }

  async disconnect(userId: string) {
    await this.prisma.sellerPaymentAccount.deleteMany({ where: { userId } });
    return { disconnected: true, note: 'A autorização deve ser revogada também no painel do Mercado Pago; a revogação remota não está disponível neste fluxo.' };
  }

  async createForNegotiation(negotiationId: string) {
    const negotiation = await this.prisma.negotiation.findUnique({
      where: { id: negotiationId },
      include: { listing: { include: { book: true } }, participants: true, payment: true },
    });
    if (!negotiation || negotiation.type !== 'SALE') throw new NotFoundException('Negociação de venda não encontrada.');
    if (!negotiation.listing.price) throw new BadRequestException('Anúncio sem preço.');
    const sellerAccount = await this.prisma.sellerPaymentAccount.findUnique({ where: { userId: negotiation.listing.ownerId } });
    if (!sellerAccount || sellerAccount.status !== 'ACTIVE') throw new ConflictException('Conta Mercado Pago do vendedor indisponível.');
    if (!this.splitEnabled()) throw new ServiceUnavailableException('Checkout bloqueado: split do marketplace não está habilitado.');

    if (negotiation.payment?.checkoutUrl && negotiation.payment.providerPreferenceId) return negotiation.payment;
    const amount = this.toMoney(negotiation.listing.price);
    const fee = this.marketplaceFee(amount);
    this.assertProductionUrls();
    const token = await this.getValidAccessToken(sellerAccount);
    const payment = negotiation.payment ?? await this.prisma.payment.create({
      data: { negotiationId, amount, marketplaceFee: fee },
    });
    const itemTitle = `${negotiation.listing.book.title} — MeLivrei`.slice(0, 256);
    const preference = await this.mercadoPago.createPreference(token, {
      items: [{ id: negotiation.listingId, title: itemTitle, quantity: 1, currency_id: 'BRL', unit_price: amount }],
      external_reference: negotiation.id,
      marketplace_fee: fee,
      back_urls: {
        success: this.config.getOrThrow<string>('MERCADO_PAGO_SUCCESS_URL'),
        failure: this.config.getOrThrow<string>('MERCADO_PAGO_FAILURE_URL'),
        pending: this.config.getOrThrow<string>('MERCADO_PAGO_PENDING_URL'),
      },
      auto_return: 'approved',
      notification_url: this.config.getOrThrow<string>('MERCADO_PAGO_WEBHOOK_URL'),
      statement_descriptor: 'MELIVREI',
    }, `negotiation-${negotiationId}`);
    const checkoutUrl = this.config.get<string>('MERCADO_PAGO_ENVIRONMENT') === 'test'
      ? preference.sandbox_init_point ?? preference.init_point
      : preference.init_point;
    if (!preference.id || !checkoutUrl) throw new ServiceUnavailableException('Mercado Pago não retornou o checkout.');
    return this.prisma.payment.update({
      where: { id: payment.id },
      data: { providerPreferenceId: preference.id, checkoutUrl, amount, marketplaceFee: fee },
    });
  }

  async prepareBrick(negotiationId: string, buyerId: string) {
    const negotiation = await this.prisma.negotiation.findFirst({
      where: { id: negotiationId, type: 'SALE', participants: { some: { userId: buyerId } } },
      include: {
        listing: true,
        participants: { where: { userId: buyerId }, include: { user: { select: { email: true } } } },
        payment: true,
      },
    });
    if (!negotiation || negotiation.listing.ownerId === buyerId)
      throw new NotFoundException('Compra não encontrada.');
    if (negotiation.status !== NegotiationStatus.PENDING_PAYMENT)
      throw new ConflictException('Esta compra não está aguardando pagamento.');
    await this.assertSellerCanReceive(negotiation.listing.ownerId);
    const amount = this.toMoney(negotiation.listing.price);
    const payment = negotiation.payment ?? await this.prisma.payment.create({
      data: { negotiationId, amount, marketplaceFee: this.marketplaceFee(amount) },
    });
    return {
      amount: Number(payment.amount),
      status: payment.status,
      submitted: Boolean(payment.providerPaymentId),
      payer: { email: negotiation.participants[0]?.user.email },
    };
  }

  async submitBrick(negotiationId: string, buyerId: string, data: Record<string, unknown>) {
    const negotiation = await this.prisma.negotiation.findFirst({
      where: { id: negotiationId, type: 'SALE', participants: { some: { userId: buyerId } } },
      include: {
        listing: { include: { book: true } },
        participants: { where: { userId: buyerId }, include: { user: { select: { email: true } } } },
        payment: true,
      },
    });
    if (!negotiation || negotiation.listing.ownerId === buyerId)
      throw new NotFoundException('Compra não encontrada.');
    if (negotiation.status !== NegotiationStatus.PENDING_PAYMENT || !negotiation.payment)
      throw new ConflictException('Prepare o checkout antes de enviar o pagamento.');
    if (negotiation.payment.providerPaymentId)
      throw new ConflictException('Este pagamento já foi enviado e está sendo processado.');
    await this.assertSellerCanReceive(negotiation.listing.ownerId);

    const token = typeof data.token === 'string' ? data.token : '';
    const method = typeof data.payment_method_id === 'string' ? data.payment_method_id : '';
    const paymentType = typeof data.payment_type === 'string' ? data.payment_type : '';
    const payer = data.payer && typeof data.payer === 'object'
      ? data.payer as Record<string, unknown>
      : {};
    const buyerEmail = negotiation.participants[0]?.user.email;
    if (!method || !buyerEmail ||
        !((paymentType === 'bank_transfer' && method === 'pix') ||
          (paymentType === 'creditCard' && token)))
      throw new BadRequestException('Dados de pagamento incompletos.');

    const account = await this.prisma.sellerPaymentAccount.findUniqueOrThrow({ where: { userId: negotiation.listing.ownerId } });
    const accessToken = await this.getValidAccessToken(account);
    const amount = Number(negotiation.payment.amount);
    const request: Record<string, unknown> = {
      payment_method_id: method,
      transaction_amount: amount,
      installments: Number.isInteger(data.installments) ? data.installments : 1,
      payer: { email: buyerEmail, ...(payer.identification ? { identification: payer.identification } : {}) },
      external_reference: negotiationId,
      application_fee: Number(negotiation.payment.marketplaceFee),
      notification_url: this.config.getOrThrow<string>('MERCADO_PAGO_WEBHOOK_URL'),
      description: `${negotiation.listing.book.title} — MeLivrei`.slice(0, 256),
    };
    if (token) request.token = token;
    if (typeof data.issuer_id === 'string') request.issuer_id = data.issuer_id;
    const result = await this.mercadoPago.createPayment(
      accessToken,
      request,
      `negotiation-${negotiationId}-${this.hash(JSON.stringify(data))}`,
    );
    if (!result.id) throw new ServiceUnavailableException('Mercado Pago não retornou o pagamento.');
    const saved = await this.prisma.payment.update({
      where: { id: negotiation.payment.id },
      data: {
        providerPaymentId: String(result.id),
        providerStatus: result.status,
        paymentMethodId: result.payment_method_id ?? method,
      },
    });
    return {
      id: saved.id,
      status: saved.status,
      pix: method === 'pix' ? {
        qrCode: result.point_of_interaction?.transaction_data?.qr_code ?? null,
        qrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
      } : null,
    };
  }

  async pixForParticipant(negotiationId: string, buyerId: string) {
    const negotiation = await this.prisma.negotiation.findFirst({
      where: { id: negotiationId, type: 'SALE', participants: { some: { userId: buyerId } } },
      include: { listing: true, payment: true },
    });
    if (!negotiation || negotiation.listing.ownerId === buyerId ||
        negotiation.payment?.paymentMethodId !== 'pix' || !negotiation.payment.providerPaymentId)
      throw new NotFoundException('Código Pix não encontrado.');
    const account = await this.prisma.sellerPaymentAccount.findUniqueOrThrow({
      where: { userId: negotiation.listing.ownerId },
    });
    const remote = await this.mercadoPago.getPayment(
      await this.getValidAccessToken(account), negotiation.payment.providerPaymentId,
    );
    if (remote.external_reference !== negotiationId || String(remote.id) !== negotiation.payment.providerPaymentId)
      throw new BadRequestException('Pagamento Pix não corresponde à compra.');
    return {
      qrCode: remote.point_of_interaction?.transaction_data?.qr_code ?? null,
      qrCodeBase64: remote.point_of_interaction?.transaction_data?.qr_code_base64 ?? null,
    };
  }

  async createForParticipant(negotiationId: string, userId: string) {
    const negotiation = await this.prisma.negotiation.findFirst({
      where: { id: negotiationId, type: 'SALE', participants: { some: { userId } } },
      include: { listing: true },
    });
    if (!negotiation) throw new NotFoundException('Negociação de venda não encontrada.');
    if (negotiation.listing.ownerId === userId) throw new ForbiddenException('Somente o comprador pode iniciar o checkout.');
    if (negotiation.status !== NegotiationStatus.PENDING_PAYMENT) throw new ConflictException('Esta negociação não aceita checkout.');
    return this.createForNegotiation(negotiationId);
  }

  async listForUser(userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { negotiation: { participants: { some: { userId } } } },
      include: { negotiation: { include: { listing: { include: { book: true } }, participants: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return payments.map(({ id, negotiationId, amount, marketplaceFee, status, checkoutUrl, createdAt, providerStatus, negotiation }) => ({
      id, negotiationId, amount, marketplaceFee, status, checkoutUrl, createdAt, providerStatus,
      listing: { id: negotiation.listingId, title: negotiation.listing.book.title },
      role: negotiation.listing.ownerId === userId ? 'SELLER' : 'BUYER',
    }));
  }

  async processWebhook(
    payload: Buffer | undefined,
    signature: string | undefined,
    requestId: string | undefined,
    queryId: string | undefined,
  ) {
    if (!payload || !signature || !queryId) throw new BadRequestException('Notificação incompleta.');
    const event = this.parseWebhook(payload);
    const bodyId = event.data?.id == null ? undefined : String(event.data.id);
    if (!bodyId || bodyId !== queryId) throw new BadRequestException('Identificador da notificação inválido.');
    this.verifyWebhookSignature(signature, requestId, queryId);
    if (!['payment', 'merchant_order'].includes(event.type ?? '')) return { processed: false, reason: 'Evento ignorado.' };
    if (event.type !== 'payment') return { processed: false, reason: 'Evento de ordem comercial não processado.' };

    const sellerId = event.user_id == null ? undefined : String(event.user_id);
    if (!sellerId) throw new BadRequestException('Notificação sem identificador do vendedor.');
    const account = await this.prisma.sellerPaymentAccount.findUnique({ where: { providerUserId: sellerId } });
    if (!account || account.status !== 'ACTIVE') throw new NotFoundException('Conta de pagamento não encontrada.');
    const token = await this.getValidAccessToken(account);
    const remote = await this.mercadoPago.getPayment(token, queryId);
    if (String(remote.id) !== queryId || remote.currency_id !== 'BRL' || !remote.external_reference)
      throw new BadRequestException('Pagamento remoto não corresponde ao pedido esperado.');
    const payment = await this.prisma.payment.findUnique({
      where: { negotiationId: remote.external_reference },
      include: { negotiation: { include: { listing: true } } },
    });
    if (!payment) throw new NotFoundException('Pagamento não encontrado.');
    if (payment.negotiation.listing.ownerId !== account.userId)
      throw new BadRequestException('Referência de negociação inválida.');
    if (Math.round(Number(remote.transaction_amount ?? 0) * 100) !== Math.round(Number(payment.amount) * 100))
      throw new BadRequestException('Valor confirmado não corresponde ao pedido.');

    const eventKey = event.id != null
      ? `mp:${event.id}`
      : requestId?.trim() || this.hash(`${event.type}:${event.action ?? ''}:${queryId}:${remote.date_last_updated ?? remote.status}`);
    if (await this.prisma.paymentEvent.findUnique({ where: { providerEventId: eventKey } }))
      return { processed: false, reason: 'Notificação já processada.' };
    const status = this.mapStatus(remote.status);
    const remoteUpdatedAt = remote.date_last_updated ? new Date(remote.date_last_updated) : new Date();
    if (Number.isNaN(remoteUpdatedAt.getTime())) throw new BadRequestException('Data de atualização do pagamento inválida.');
    if (payment.providerUpdatedAt && remoteUpdatedAt < payment.providerUpdatedAt)
      return { processed: false, reason: 'Estado remoto mais antigo ignorado.' };
    if (
      (payment.status === PaymentStatus.APPROVED && status === PaymentStatus.PENDING) ||
      ((payment.status === PaymentStatus.REFUNDED || payment.status === PaymentStatus.IN_DISPUTE) && status !== payment.status)
    )
      return { processed: false, reason: 'Estado remoto não pode regredir um estado terminal.' };

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.paymentEvent.create({
          data: {
            paymentId: payment.id,
            providerEventId: eventKey,
            eventType: event.action ?? `payment.${remote.status}`,
            payloadHash: createHash('sha256').update(payload).digest('hex'),
            processedAt: new Date(),
          },
        });
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            providerPaymentId: queryId,
            providerStatus: remote.status,
            providerUpdatedAt: remoteUpdatedAt,
            paymentMethodId: remote.payment_method_id,
            status,
          },
        });
        const negotiationStatus = status === PaymentStatus.APPROVED
          ? NegotiationStatus.APPROVED
          : status === PaymentStatus.REFUSED || status === PaymentStatus.EXPIRED || status === PaymentStatus.CANCELLED
            ? NegotiationStatus.CANCELLED
            : undefined;
        if (negotiationStatus) await tx.negotiation.update({ where: { id: payment.negotiationId }, data: { status: negotiationStatus } });
        await tx.auditEvent.create({
          data: { negotiationId: payment.negotiationId, action: `PAYMENT_${status}`, entityType: 'Payment', entityId: payment.id },
        });
        if (status === PaymentStatus.REFUSED || status === PaymentStatus.EXPIRED || status === PaymentStatus.CANCELLED) {
          await tx.listing.update({ where: { id: payment.negotiation.listingId }, data: { status: ListingStatus.AVAILABLE } });
        }
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Unique constraint')) return { processed: false, reason: 'Notificação já processada.' };
      throw error;
    }
    return { processed: true, status };
  }

  private parseWebhook(payload: Buffer): MpWebhook {
    try { return JSON.parse(payload.toString('utf8')) as MpWebhook; }
    catch { throw new BadRequestException('Corpo de notificação inválido.'); }
  }

  private verifyWebhookSignature(signature: string, requestId: string | undefined, paymentId: string) {
    const fields = Object.fromEntries(signature.split(',').map((part) => {
      const [key, ...value] = part.trim().split('=');
      return [key, value.join('=')];
    }));
    const ts = fields.ts;
    const received = fields.v1;
    const timestamp = Number(ts);
    const timestampMs = timestamp < 1_000_000_000_000 ? timestamp * 1000 : timestamp;
    if (!ts || !received || !Number.isFinite(timestampMs) || Math.abs(Date.now() - timestampMs) > 5 * 60_000)
      throw new ForbiddenException('Assinatura de webhook inválida ou expirada.');
    const secret = this.config.get<string>('MERCADO_PAGO_WEBHOOK_SECRET');
    if (!secret) throw new ServiceUnavailableException('Segredo de webhook Mercado Pago não configurado.');
    const manifest = `id:${paymentId.toLowerCase()};${requestId ? `request-id:${requestId};` : ''}ts:${ts};`;
    const expected = createHmac('sha256', secret).update(manifest).digest();
    let provided: Buffer;
    try { provided = Buffer.from(received, 'hex'); } catch { throw new ForbiddenException('Assinatura de webhook inválida.'); }
    if (provided.length !== expected.length || !timingSafeEqual(expected, provided))
      throw new ForbiddenException('Assinatura de webhook inválida.');
  }

  private mapStatus(status: string): PaymentStatus {
    switch (status) {
      case 'approved': return PaymentStatus.APPROVED;
      case 'rejected': return PaymentStatus.REFUSED;
      case 'cancelled': return PaymentStatus.CANCELLED;
      case 'refunded': return PaymentStatus.REFUNDED;
      case 'charged_back': case 'in_mediation': return PaymentStatus.IN_DISPUTE;
      case 'expired': return PaymentStatus.EXPIRED;
      default: return PaymentStatus.PENDING;
    }
  }

  private splitEnabled() { return this.config.get<string>('MERCADO_PAGO_SPLIT_ENABLED') === 'true'; }

  private marketplaceFee(amount: number) {
    const percent = Number(this.config.get<string>('MERCADO_PAGO_MARKETPLACE_FEE_PERCENT') ?? '0');
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) throw new BadRequestException('Percentual de comissão inválido.');
    const fee = Math.round(amount * percent) / 100;
    if (fee < 0 || fee > amount) throw new BadRequestException('Comissão fora do valor do pedido.');
    return Number(fee.toFixed(2));
  }

  private toMoney(value: unknown) {
    const amount = Number(value);
    const cents = Math.round(amount * 100);
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isSafeInteger(cents) || cents < 1)
      throw new BadRequestException('Valor do anúncio inválido para pagamento.');
    return cents / 100;
  }

  private assertProductionUrls() {
    if (this.config.get<string>('MERCADO_PAGO_ENVIRONMENT') !== 'production') return;
    const urls = [
      this.config.getOrThrow<string>('MERCADO_PAGO_WEBHOOK_URL'),
      this.config.getOrThrow<string>('MERCADO_PAGO_SUCCESS_URL'),
      this.config.getOrThrow<string>('MERCADO_PAGO_FAILURE_URL'),
      this.config.getOrThrow<string>('MERCADO_PAGO_PENDING_URL'),
    ];
    if (urls.some((value) => new URL(value).protocol !== 'https:'))
      throw new BadRequestException('URLs de checkout e webhook devem usar HTTPS em produção.');
  }

  private async getValidAccessToken(account: { id: string; accessTokenEncrypted: string; refreshTokenEncrypted: string; tokenExpiresAt: Date }) {
    if (account.tokenExpiresAt.getTime() > Date.now() + 60_000) return this.decrypt(account.accessTokenEncrypted);
    try {
      const tokens = await this.mercadoPago.refreshToken(this.decrypt(account.refreshTokenEncrypted));
      await this.saveSellerAccountById(account.id, tokens);
      return tokens.access_token;
    } catch (error) {
      if (!(error instanceof UnauthorizedException)) throw error;
      await this.prisma.sellerPaymentAccount.update({ where: { id: account.id }, data: { status: 'REAUTH_REQUIRED' } });
      throw new ConflictException('A conta Mercado Pago precisa ser vinculada novamente.');
    }
  }

  private async saveSellerAccount(userId: string, tokens: MpToken) {
    if (!tokens.access_token || !tokens.refresh_token || !tokens.user_id || !tokens.expires_in)
      throw new ServiceUnavailableException('Resposta OAuth Mercado Pago incompleta.');
    const data = {
      providerUserId: String(tokens.user_id),
      accessTokenEncrypted: this.encrypt(tokens.access_token),
      refreshTokenEncrypted: this.encrypt(tokens.refresh_token),
      tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      publicKey: tokens.public_key,
      scope: tokens.scope,
      status: 'ACTIVE',
    };
    await this.prisma.sellerPaymentAccount.upsert({ where: { userId }, create: { userId, ...data }, update: data });
  }

  private async saveSellerAccountById(id: string, tokens: MpToken) {
    await this.prisma.sellerPaymentAccount.update({
      where: { id },
      data: {
        providerUserId: String(tokens.user_id),
        accessTokenEncrypted: this.encrypt(tokens.access_token),
        refreshTokenEncrypted: this.encrypt(tokens.refresh_token),
        tokenExpiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        publicKey: tokens.public_key,
        scope: tokens.scope,
        status: 'ACTIVE',
      },
    });
  }

  private encryptionKey() {
    const key = Buffer.from(this.config.getOrThrow<string>('MERCADO_PAGO_TOKEN_ENCRYPTION_KEY'), 'base64');
    if (key.length !== 32) throw new ServiceUnavailableException('MERCADO_PAGO_TOKEN_ENCRYPTION_KEY deve ser base64 de 32 bytes.');
    return key;
  }

  private encrypt(value: string) {
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.encryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64')).join('.');
  }

  private decrypt(value: string) {
    const [ivText, tagText, encryptedText] = value.split('.');
    if (!ivText || !tagText || !encryptedText) throw new ServiceUnavailableException('Token Mercado Pago criptografado inválido.');
    try {
      const decipher = createDecipheriv('aes-256-gcm', this.encryptionKey(), Buffer.from(ivText, 'base64'));
      decipher.setAuthTag(Buffer.from(tagText, 'base64'));
      return Buffer.concat([decipher.update(Buffer.from(encryptedText, 'base64')), decipher.final()]).toString('utf8');
    } catch { throw new ServiceUnavailableException('Não foi possível descriptografar tokens Mercado Pago.'); }
  }

  private hash(value: string) { return createHash('sha256').update(value).digest('hex'); }
}
