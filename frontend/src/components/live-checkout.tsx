"use client";

import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { IPaymentFormData } from "@mercadopago/sdk-react/esm/bricks/payment/type";
import { browserApi, formatPrice, type Negotiation } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY?.trim();
const paymentLabels: Record<string, string> = {
  PENDING: "Aguardando pagamento",
  APPROVED: "Pagamento aprovado",
  REFUSED: "Pagamento recusado",
  EXPIRED: "Pagamento expirado",
  CANCELLED: "Pagamento cancelado",
  REFUNDED: "Pagamento estornado",
  IN_DISPUTE: "Pagamento em análise",
};

type Payment = {
  amount: string | number;
  status: string;
  payer: { email: string };
  submitted: boolean;
};
type PixData = { qrCode: string | null; qrCodeBase64: string | null };

type Purchase = Omit<Negotiation, "payment"> & {
  payment:
    | (Omit<Payment, "payer" | "submitted"> & {
        payer?: Payment["payer"];
        submitted?: boolean;
        providerPaymentId?: string | null;
        paymentMethodId?: string | null;
      })
    | null;
};
const pendingStatus = (status: string) => status === "PENDING_PAYMENT";

function PaymentForm({
  payment,
  negotiationId,
  onError,
  onSubmitted,
}: {
  payment: Payment;
  negotiationId: string;
  onError: (message: string) => void;
  onSubmitted: (pix: PixData | null) => void;
}) {
  const [initialized, setInitialized] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const initialization = useMemo(
    () => ({
      amount: Number(payment.amount),
      payer: { email: payment.payer.email },
      marketplace: true,
    }),
    [payment.amount, payment.payer.email],
  );
  const customization = useMemo(
    () => ({
      paymentMethods: {
        creditCard: "all" as const,
        bankTransfer: ["pix"],
      },
    }),
    [],
  );
  const onReady = useCallback(() => setReady(true), []);
  const onBrickError = useCallback(() => {
    setFailed(true);
    onError("O formulário do Mercado Pago não carregou corretamente.");
  }, [onError]);

  useEffect(() => {
    if (publicKey) {
      initMercadoPago(publicKey, { locale: "pt-BR" });
      setInitialized(true);
    }
  }, []);

  async function submit({ formData, paymentType }: IPaymentFormData) {
    try {
      const result = await browserApi<{ pix: PixData | null }>(
        `/payments/negotiations/${encodeURIComponent(negotiationId)}/submit`,
        {
          method: "POST",
          body: JSON.stringify({ ...formData, payment_type: paymentType }),
        },
      );
      onSubmitted(result.pix);
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : "Não foi possível enviar o pagamento.";
      onError(message);
      throw cause;
    }
  }

  return (
    <>
      {initialized && !failed && (
        <Payment
          initialization={initialization}
          customization={customization}
          onSubmit={submit}
          onReady={onReady}
          onError={onBrickError}
          locale="pt-BR"
        />
      )}
      {publicKey && !ready && !failed && (
        <p role="status">Carregando Mercado Pago…</p>
      )}
      {failed && (
        <p className="form-error" role="alert">
          O formulário de pagamento não carregou. Atualize a página e tente
          novamente.
        </p>
      )}
      {!publicKey && (
        <p className="form-error" role="alert">
          Configure a chave pública do Mercado Pago para carregar o formulário
          de pagamento.
        </p>
      )}
    </>
  );
}

export function LiveCheckout({
  id,
  checkout = false,
}: {
  id: string;
  checkout?: boolean;
}) {
  const session = authClient.useSession();
  const userId = session.data?.user.id;
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [preparing, setPreparing] = useState(false);
  const [pix, setPix] = useState<PixData | null>(null);
  const [pixRequested, setPixRequested] = useState(false);
  const path = `/negociacoes/${encodeURIComponent(id)}`;

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    browserApi<Purchase>(`/negotiations/${encodeURIComponent(id)}`, {
      signal: controller.signal,
    })
      .then((data) => {
        if (!controller.signal.aborted) setPurchase(data);
      })
      .catch((cause: Error) => {
        if (!controller.signal.aborted) setError(cause.message);
      });
    return () => controller.abort();
  }, [id, userId, attempt]);

  useEffect(() => {
    if (
      !checkout ||
      !userId ||
      !purchase ||
      !pendingStatus(purchase.status) ||
      purchase.payment?.payer?.email
    )
      return;
    setPreparing(true);
    browserApi<Payment>(
      `/payments/negotiations/${encodeURIComponent(id)}/checkout`,
      { method: "POST" },
    )
      .then((payment) =>
        setPurchase((current) => current && { ...current, payment }),
      )
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setPreparing(false));
  }, [checkout, id, userId, purchase, attempt]);

  const pixPaymentId =
    purchase?.payment?.paymentMethodId === "pix"
      ? purchase.payment.providerPaymentId
      : null;
  useEffect(() => {
    if (!checkout || !pixPaymentId || pixRequested) return;
    setPixRequested(true);
    browserApi<PixData>(
      `/payments/negotiations/${encodeURIComponent(id)}/pix`,
      {},
    )
      .then(setPix)
      .catch((cause: Error) => setError(cause.message));
  }, [checkout, id, pixPaymentId, pixRequested]);

  function refresh() {
    setError("");
    setAttempt((current) => current + 1);
  }

  function completePayment(pixData: PixData | null) {
    setError("");
    if (pixData) {
      setPix(pixData);
      setPixRequested(true);
    }
    setAttempt((current) => current + 1);
  }

  if (session.isPending || (userId && !purchase && !error)) {
    return (
      <div className="shell negotiation-page" role="status">
        Carregando compra…
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="shell negotiation-page">
        <h1>Entre para acessar sua compra</h1>
        <Link
          className="button"
          href={`/entrar?voltar=${encodeURIComponent(checkout ? `${path}/checkout` : path)}`}
        >
          Entrar
        </Link>
      </div>
    );
  }

  if (!purchase || purchase.type !== "SALE") {
    return (
      <div className="shell negotiation-page">
        <h1>Compra indisponível</h1>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        {error && (
          <button className="button" type="button" onClick={refresh}>
            Tentar novamente
          </button>
        )}
        <Link className="text-link" href="/livros">
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  const { listing, payment } = purchase;
  const total = formatPrice(payment?.amount ?? listing.price);
  const pending = purchase.status === "PENDING_PAYMENT";
  const canPay = pending && userId !== listing.ownerId;
  const status =
    paymentLabels[payment?.status ?? (pending ? "PENDING" : purchase.status)] ??
    "Compra em andamento";
  const paymentSubmitted = Boolean(
    payment?.submitted || payment?.providerPaymentId,
  );

  return (
    <div className="shell negotiation-page checkout-page">
      <Link className="quiet-link" href={checkout ? path : "/minha-conta"}>
        {checkout ? "← Voltar para a compra" : "← Minhas compras e vendas"}
      </Link>
      <h1>{checkout ? "Finalizar compra" : "Sua compra"}</h1>
      <div className="checkout-grid">
        <div className="form-panel form-stack">
          <div>
            <h2>Pagamento</h2>
            <span className="status">{status}</span>
            {pending && (
              <p>
                Combine a entrega com o vendedor após a confirmação do
                pagamento.
              </p>
            )}
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {checkout && paymentSubmitted && pending && (
            <>
              {pix?.qrCode ? (
                <div className="checkout-pix-state">
                  <h3>Pague com Pix</h3>
                  <p>
                    Escaneie o QR Code ou copie o código no aplicativo do seu
                    banco.
                  </p>
                  {pix.qrCodeBase64 && (
                    <img
                      className="checkout-pix-qr"
                      src={`data:image/png;base64,${pix.qrCodeBase64}`}
                      alt="QR Code do pagamento Pix"
                    />
                  )}
                  <label htmlFor="pix-copy-code">Pix copia e cola</label>
                  <textarea
                    id="pix-copy-code"
                    readOnly
                    value={pix.qrCode}
                    rows={3}
                  />
                  <button
                    className="button"
                    type="button"
                    onClick={() =>
                      void navigator.clipboard.writeText(pix.qrCode!)
                    }
                  >
                    Copiar código Pix
                  </button>
                </div>
              ) : (
                <p role="status">
                  Pagamento enviado. Aguardando confirmação do Mercado Pago.
                </p>
              )}
              <button className="text-button" type="button" onClick={refresh}>
                Atualizar status
              </button>
            </>
          )}
          {checkout &&
            canPay &&
            !paymentSubmitted &&
            (payment?.payer?.email ? (
              <PaymentForm
                key={id}
                payment={{
                  ...payment,
                  payer: payment.payer!,
                  submitted: paymentSubmitted,
                }}
                negotiationId={id}
                onError={setError}
                onSubmitted={completePayment}
              />
            ) : (
              <p role="status">
                {preparing
                  ? "Carregando formulário de pagamento…"
                  : "O formulário de pagamento ficará disponível em instantes."}
              </p>
            ))}
          {!checkout && canPay && (
            <Link className="button" href={`${path}/checkout`}>
              Ir para o checkout
            </Link>
          )}
          {!checkout && pending && (
            <button className="text-button" type="button" onClick={refresh}>
              Atualizar status
            </button>
          )}
        </div>
        <aside className="form-panel" aria-labelledby="checkout-summary">
          <h2 id="checkout-summary">Resumo do pedido</h2>
          <strong>{listing.book.title}</strong>
          <p>{listing.book.author}</p>
          <p>Vendido por {listing.owner.name}</p>
          <dl className="checkout-costs">
            <div>
              <dt>Livro · 1 unidade</dt>
              <dd>{total}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{total}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
