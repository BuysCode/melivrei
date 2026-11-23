import { Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway } from './payment-gateway.js';

type MpTokenResponse = {
  access_token: string;
  refresh_token: string;
  user_id: number | string;
  expires_in: number;
  public_key?: string;
  scope?: string;
};

@Injectable()
export class MercadoPagoGateway extends PaymentGateway {
  private readonly api = 'https://api.mercadopago.com';
  private readonly auth = 'https://auth.mercadopago.com/authorization';

  constructor(private readonly config: ConfigService) { super(); }

  authorizationUrl(state: string) {
    const url = new URL(this.auth);
    url.searchParams.set('client_id', this.config.getOrThrow('MERCADO_PAGO_CLIENT_ID'));
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('platform_id', 'mp');
    url.searchParams.set('scope', 'offline_access');
    url.searchParams.set('state', state);
    url.searchParams.set('redirect_uri', this.config.getOrThrow('MERCADO_PAGO_REDIRECT_URI'));
    return url.toString();
  }

  exchangeCode(code: string) {
    return this.tokenRequest({ grant_type: 'authorization_code', code });
  }

  refreshToken(refreshToken: string) {
    return this.tokenRequest({ grant_type: 'refresh_token', refresh_token: refreshToken });
  }

  async createPreference(accessToken: string, body: Record<string, unknown>, idempotencyKey: string) {
    return this.request<{ id: string; init_point?: string; sandbox_init_point?: string }>(
      '/checkout/preferences', accessToken, {
        method: 'POST',
        headers: { 'X-Idempotency-Key': idempotencyKey },
        body: JSON.stringify(body),
      },
    );
  }

  createPayment(accessToken: string, body: Record<string, unknown>, idempotencyKey: string) {
    return this.request<MpPayment>('/v1/payments', accessToken, {
      method: 'POST',
      headers: { 'X-Idempotency-Key': idempotencyKey },
      body: JSON.stringify(body),
    });
  }

  getPayment(accessToken: string, paymentId: string) {
    return this.request<MpPayment>(`/v1/payments/${encodeURIComponent(paymentId)}`, accessToken);
  }

  private async tokenRequest(values: Record<string, string>) {
    return this.request<MpTokenResponse>('/oauth/token', undefined, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...values,
        client_id: this.config.getOrThrow('MERCADO_PAGO_CLIENT_ID'),
        client_secret: this.config.getOrThrow('MERCADO_PAGO_CLIENT_SECRET'),
        ...(values.grant_type === 'authorization_code'
          ? { redirect_uri: this.config.getOrThrow('MERCADO_PAGO_REDIRECT_URI') }
          : {}),
      }),
    });
  }

  private async request<T>(path: string, accessToken?: string, init: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await fetch(`${this.api}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          ...init.headers,
        },
      });
      if (!response.ok) {
        // Do not relay provider bodies: they can contain identifiers or credentials.
        if (path === '/oauth/token' && [400, 401].includes(response.status))
          throw new UnauthorizedException('Renovação OAuth recusada pelo provedor.');
        throw new ServiceUnavailableException(`Mercado Pago indisponível (HTTP ${response.status}).`);
      }
      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException('Falha de comunicação com o Mercado Pago.');
    } finally {
      clearTimeout(timeout);
    }
  }
}

export type MpPayment = {
  id: number | string;
  status: string;
  status_detail?: string;
  date_last_updated?: string;
  transaction_amount?: number;
  currency_id?: string;
  payment_method_id?: string;
  external_reference?: string;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
    };
  };
};

export type MpToken = MpTokenResponse;
