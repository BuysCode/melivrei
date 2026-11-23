import { ConflictException, ForbiddenException, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { jest } from '@jest/globals';
import { createCipheriv, createHmac } from 'node:crypto';
import { PrismaService } from '../database/prisma.service.js';
import { PaymentGateway } from './payment-gateway.js';
import { PaymentsService } from './payments.service.js';

describe('PaymentsService Mercado Pago safeguards', () => {
  const prisma = {
    sellerPaymentAccount: { findUnique: jest.fn(), upsert: jest.fn(), update: jest.fn(), deleteMany: jest.fn() },
    mercadoPagoOAuthState: { create: jest.fn(), findUnique: jest.fn(), updateMany: jest.fn() },
    payment: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
    paymentEvent: { findUnique: jest.fn() },
    negotiation: { findUnique: jest.fn() },
    $transaction: jest.fn(),
  };
  const config = {
    get: jest.fn((key: string) => key === 'MERCADO_PAGO_SPLIT_ENABLED' ? 'false' : key === 'MERCADO_PAGO_WEBHOOK_SECRET' ? 'webhook-secret' : key === 'MERCADO_PAGO_MARKETPLACE_FEE_PERCENT' ? '10' : key === 'MERCADO_PAGO_ENVIRONMENT' ? 'test' : undefined),
    getOrThrow: jest.fn((key: string) => key === 'MERCADO_PAGO_TOKEN_ENCRYPTION_KEY' ? Buffer.alloc(32, 7).toString('base64') : 'configured'),
  };
  const gateway = {
    authorizationUrl: jest.fn(() => 'https://auth.mercadopago.com/authorization'),
    exchangeCode: jest.fn(),
    refreshToken: jest.fn(),
    createPreference: jest.fn(),
    getPayment: jest.fn(),
  };
  let service: PaymentsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PaymentsService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
      gateway as unknown as PaymentGateway,
    );
  });

  it('bloqueia a venda se o split de marketplace não foi habilitado', async () => {
    await expect(service.assertSellerCanReceive('seller-1')).rejects.toThrow(ServiceUnavailableException);
    expect(prisma.sellerPaymentAccount.findUnique).not.toHaveBeenCalled();
  });

  it('cria preferência com preço do anúncio persistido e comissão configurada', async () => {
    config.get.mockImplementation((key: string) => key === 'MERCADO_PAGO_SPLIT_ENABLED' ? 'true' : key === 'MERCADO_PAGO_WEBHOOK_SECRET' ? 'webhook-secret' : key === 'MERCADO_PAGO_MARKETPLACE_FEE_PERCENT' ? '10' : key === 'MERCADO_PAGO_ENVIRONMENT' ? 'test' : undefined);
    const key = Buffer.alloc(32, 7);
    const iv = Buffer.alloc(12, 5);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update('seller-token'), cipher.final()]);
    const encryptedToken = [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64')).join('.');
    prisma.negotiation.findUnique.mockResolvedValue({
      id: 'neg-1', type: 'SALE', payment: null, participants: [],
      listing: { id: 'listing-1', ownerId: 'seller-1', price: 123.45, book: { title: 'Livro' } },
    });
    prisma.sellerPaymentAccount.findUnique.mockResolvedValue({
      id: 'account-1', userId: 'seller-1', status: 'ACTIVE', accessTokenEncrypted: encryptedToken,
      tokenExpiresAt: new Date(Date.now() + 10 * 60_000),
    });
    prisma.payment.create.mockResolvedValue({ id: 'payment-1', negotiationId: 'neg-1' });
    gateway.createPreference.mockResolvedValue({ id: 'pref-1', sandbox_init_point: 'https://sandbox.mercadopago.test/checkout' });
    prisma.payment.update.mockResolvedValue({ id: 'payment-1', checkoutUrl: 'https://sandbox.mercadopago.test/checkout' });

    await service.createForNegotiation('neg-1');
    expect(gateway.createPreference).toHaveBeenCalledWith('seller-token', expect.objectContaining({
      items: [expect.objectContaining({ unit_price: 123.45 })], marketplace_fee: 12.35,
      external_reference: 'neg-1',
    }), 'negotiation-neg-1');
    expect(prisma.payment.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ marketplaceFee: 12.35 }) }));
  });

  it('recusa state OAuth inválido sem trocar o código por tokens', async () => {
    prisma.mercadoPagoOAuthState.findUnique.mockResolvedValue(null);
    await expect(service.completeConnection('code', 'forged-state')).rejects.toThrow(ForbiddenException);
    expect(gateway.exchangeCode).not.toHaveBeenCalled();
  });

  it('consome state OAuth de uso único e persiste tokens cifrados', async () => {
    prisma.mercadoPagoOAuthState.findUnique.mockResolvedValue({
      id: 'state-id', userId: 'seller-1', consumedAt: null, expiresAt: new Date(Date.now() + 60_000),
    });
    prisma.mercadoPagoOAuthState.updateMany.mockResolvedValue({ count: 1 });
    gateway.exchangeCode.mockResolvedValue({
      access_token: 'sensitive-access', refresh_token: 'sensitive-refresh', user_id: 123, expires_in: 21_600,
    });
    prisma.sellerPaymentAccount.upsert.mockResolvedValue({});

    const result = await service.completeConnection('valid-code', 'valid-state');
    expect(result.connected).toBe(true);
    expect(prisma.mercadoPagoOAuthState.updateMany).toHaveBeenCalledTimes(1);
    const saved = prisma.sellerPaymentAccount.upsert.mock.calls[0]?.[0] as { create: Record<string, unknown> };
    expect(saved.create.accessTokenEncrypted).not.toBe('sensitive-access');
    expect(saved.create.refreshTokenEncrypted).not.toBe('sensitive-refresh');
    expect(JSON.stringify(result)).not.toContain('sensitive');
  });

  it('rejeita assinatura inválida de webhook antes de consultar o pagamento', async () => {
    const payload = Buffer.from(JSON.stringify({ type: 'payment', data: { id: 'pay-1' } }));
    await expect(service.processWebhook(payload, 'ts=1,v1=00', 'req-1', 'pay-1')).rejects.toThrow(ForbiddenException);
    expect(prisma.sellerPaymentAccount.findUnique).not.toHaveBeenCalled();
    expect(gateway.getPayment).not.toHaveBeenCalled();
  });

  it('exige nova autorização se o provedor recusar a renovação do token', async () => {
    config.get.mockImplementation((key: string) => key === 'MERCADO_PAGO_SPLIT_ENABLED' ? 'true' : key === 'MERCADO_PAGO_WEBHOOK_SECRET' ? 'webhook-secret' : undefined);
    const key = Buffer.alloc(32, 7);
    const iv = Buffer.alloc(12, 3);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update('refresh-token'), cipher.final()]);
    const encryptedToken = [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64')).join('.');
    prisma.negotiation.findUnique.mockResolvedValue({
      id: 'neg-1', type: 'SALE', payment: null, participants: [],
      listing: { id: 'listing-1', ownerId: 'seller-1', price: 25, book: { title: 'Livro' } },
    });
    prisma.sellerPaymentAccount.findUnique.mockResolvedValue({
      id: 'account-1', userId: 'seller-1', status: 'ACTIVE', accessTokenEncrypted: encryptedToken,
      refreshTokenEncrypted: encryptedToken, tokenExpiresAt: new Date(Date.now() - 1000),
    });
    gateway.refreshToken.mockRejectedValue(new UnauthorizedException());

    await expect(service.createForNegotiation('neg-1')).rejects.toThrow(ConflictException);
    expect(prisma.sellerPaymentAccount.update).toHaveBeenCalledWith(expect.objectContaining({ data: { status: 'REAUTH_REQUIRED' } }));
    expect(gateway.createPreference).not.toHaveBeenCalled();
  });

  it('consulta o estado remoto e atualiza uma notificação válida sem confiar no status enviado pelo webhook', async () => {
    const requestId = 'request-123';
    const ts = String(Math.floor(Date.now() / 1000));
    const paymentId = 'pay-1';
    const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`;
    const signature = `ts=${ts},v1=${createHmac('sha256', 'webhook-secret').update(manifest).digest('hex')}`;
    const payload = Buffer.from(JSON.stringify({ type: 'payment', action: 'payment.updated', user_id: 123, data: { id: paymentId }, status: 'rejected' }));
    const key = Buffer.alloc(32, 7);
    const iv = Buffer.alloc(12, 4);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update('seller-token'), cipher.final()]);
    const encryptedToken = [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64')).join('.');
    prisma.sellerPaymentAccount.findUnique.mockResolvedValue({
      id: 'account-1', userId: 'seller-1', providerUserId: '123', status: 'ACTIVE',
      tokenExpiresAt: new Date(Date.now() + 10 * 60_000), accessTokenEncrypted: encryptedToken,
    });
    gateway.getPayment.mockResolvedValue({
      id: paymentId, status: 'approved', date_last_updated: new Date().toISOString(),
      transaction_amount: 100, currency_id: 'BRL', external_reference: 'neg-1', payment_method_id: 'pix',
    });
    prisma.payment.findUnique.mockResolvedValue({
      id: 'payment-1', negotiationId: 'neg-1', amount: 100, status: 'PENDING', providerUpdatedAt: null,
      negotiation: { id: 'neg-1', listingId: 'listing-1', listing: { ownerId: 'seller-1' } },
    });
    prisma.paymentEvent.findUnique.mockResolvedValue(null);
    const tx = {
      paymentEvent: { create: jest.fn() }, payment: { update: jest.fn() },
      negotiation: { update: jest.fn() }, auditEvent: { create: jest.fn() }, listing: { update: jest.fn() },
    };
    prisma.$transaction.mockImplementation(async (callback) => (callback as (value: typeof tx) => Promise<unknown>)(tx));

    const result = await service.processWebhook(payload, signature, requestId, paymentId);
    expect(gateway.getPayment).toHaveBeenCalledWith('seller-token', paymentId);
    expect(tx.payment.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'APPROVED' }) }));
    expect(result).toEqual({ processed: true, status: 'APPROVED' });
    prisma.paymentEvent.findUnique.mockResolvedValue({ id: 'event-1' });
    await expect(service.processWebhook(payload, signature, requestId, paymentId)).resolves.toEqual({ processed: false, reason: 'Notificação já processada.' });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
  });
});
