import type { MpPayment, MpToken } from './mercado-pago.gateway.js';

/**
 * Contrato de integração com um provedor de pagamentos.
 *
 * As implementações encapsulam os detalhes de HTTP e autenticação do provedor.
 */
export abstract class PaymentGateway {
  abstract authorizationUrl(state: string): string;
  abstract exchangeCode(code: string): Promise<MpToken>;
  abstract refreshToken(refreshToken: string): Promise<MpToken>;
  abstract createPreference(
    accessToken: string,
    body: Record<string, unknown>,
    idempotencyKey: string,
  ): Promise<{
    id: string;
    init_point?: string;
    sandbox_init_point?: string;
  }>;
  abstract createPayment(
    accessToken: string,
    body: Record<string, unknown>,
    idempotencyKey: string,
  ): Promise<MpPayment>;
  abstract getPayment(
    accessToken: string,
    paymentId: string,
  ): Promise<MpPayment>;
}
