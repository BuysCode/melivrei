"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { formatPrice } from "@/lib/api";
import { currentUser, decideNegotiation, useDemoStore } from "@/lib/demo-store";

export function PurchaseCheckout({ id }: { id: string }) {
  const store = useDemoStore();
  const user = currentUser(store);
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState<"card" | "pix">("card");
  const [pixRequested, setPixRequested] = useState(false);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cpf, setCpf] = useState("");
  const purchaseUrl = `/negociacoes/${id}`;
  const negotiation = store.negotiations.find((item) => item.id === id);
  const listing = store.listings.find(
    (item) => item.id === negotiation?.listingId,
  );

  if (!user) {
    return (
      <div className="shell negotiation-page">
        <h1>Entre para finalizar sua compra</h1>
        <Link
          className="button"
          href={`/entrar?voltar=${encodeURIComponent(`${purchaseUrl}/checkout`)}`}
        >
          Entrar
        </Link>
      </div>
    );
  }

  if (
    !negotiation ||
    negotiation.type !== "SALE" ||
    negotiation.buyerId !== user.id ||
    !listing ||
    listing.price === null
  ) {
    return (
      <div className="shell negotiation-page">
        <h1>Checkout indisponível</h1>
        <Link className="text-link" href="/minha-conta">
          Minhas negociações
        </Link>
      </div>
    );
  }

  if (negotiation.status !== "PENDING_PAYMENT") {
    return (
      <div className="shell negotiation-page">
        <h1>Esta compra não tem pagamento pendente</h1>
        <Link className="text-link" href={purchaseUrl}>
          Acompanhar compra
        </Link>
      </div>
    );
  }

  const price = formatPrice(listing.price);

  function pay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (method === "pix") {
      setPixRequested(true);
      return;
    }
    setSubmitting(true);
    try {
      decideNegotiation(id, "pay");
      router.replace(purchaseUrl);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível concluir o pagamento.",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="shell negotiation-page checkout-page">
      <Link className="quiet-link" href={purchaseUrl}>
        ← Voltar para a compra
      </Link>
      <h1>Finalizar compra</h1>
      <div className="checkout-grid">
        <form className="form-panel form-stack" onSubmit={pay}>
          <div>
            <h2>Pagamento</h2>
            <p>Escolha uma forma de pagamento</p>
          </div>
          <div
            className="checkout-methods"
            role="radiogroup"
            aria-label="Forma de pagamento"
          >
            <label
              className={
                method === "pix"
                  ? "checkout-method selected"
                  : "checkout-method"
              }
            >
              <input
                type="radio"
                name="payment-method"
                value="pix"
                checked={method === "pix"}
                onChange={() => setMethod("pix")}
              />
              <span>Pix</span>
            </label>
            <label
              className={
                method === "card"
                  ? "checkout-method selected"
                  : "checkout-method"
              }
            >
              <input
                type="radio"
                name="payment-method"
                value="card"
                checked={method === "card"}
                onChange={() => setMethod("card")}
              />
              <span>Cartão de crédito</span>
            </label>
          </div>
          {method === "card" && (
            <div className="checkout-card-fields">
              <div className="field checkout-field-wide">
                <label htmlFor="card-name">Nome impresso no cartão</label>
                <input
                  id="card-name"
                  name="cc-name"
                  autoComplete="cc-name"
                  value={cardName}
                  onChange={(event) => setCardName(event.target.value)}
                  required
                />
              </div>
              <div className="field checkout-field-wide">
                <label htmlFor="card-number">Número do cartão</label>
                <input
                  id="card-number"
                  name="cc-number"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  value={cardNumber}
                  onChange={(event) =>
                    setCardNumber(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 16)
                        .replace(/(.{4})/g, "$1 ")
                        .trim(),
                    )
                  }
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="card-expiry">Validade</label>
                <input
                  id="card-expiry"
                  name="cc-exp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/AA"
                  maxLength={5}
                  value={cardExpiry}
                  onChange={(event) => {
                    const digits = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 4);
                    setCardExpiry(
                      digits.length > 2
                        ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                        : digits,
                    );
                  }}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="card-cvv">CVV</label>
                <input
                  id="card-cvv"
                  name="cc-csc"
                  type="password"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="000"
                  maxLength={4}
                  value={cardCvv}
                  onChange={(event) =>
                    setCardCvv(
                      event.target.value.replace(/\D/g, "").slice(0, 4),
                    )
                  }
                  required
                />
              </div>
              <div className="field checkout-field-wide">
                <label htmlFor="payer-cpf">CPF do titular</label>
                <input
                  id="payer-cpf"
                  name="cpf"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="000.000.000-00"
                  maxLength={14}
                  value={cpf}
                  onChange={(event) => {
                    const digits = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 11);
                    setCpf(
                      digits
                        .replace(/(\d{3})(\d)/, "$1.$2")
                        .replace(/(\d{3})(\d)/, "$1.$2")
                        .replace(/(\d{3})(\d{1,2})$/, "$1-$2"),
                    );
                  }}
                  required
                />
              </div>
            </div>
          )}
          {method === "pix" && pixRequested && (
            <output className="checkout-pix-state">
              <strong>Pagamento pendente</strong>
              <span>Aguardando confirmação do pagamento via Pix.</span>
              <Link className="text-link" href={purchaseUrl}>
                Acompanhar compra
              </Link>
            </output>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {(!pixRequested || method === "card") && (
            <button
              className="button button-wide"
              type="submit"
              disabled={submitting}
            >
              {submitting
                ? "Confirmando pagamento…"
                : method === "pix"
                  ? `Continuar com Pix · ${price}`
                  : `Confirmar pagamento · ${price}`}
            </button>
          )}
        </form>
        <aside className="form-panel" aria-labelledby="checkout-summary">
          <h2 id="checkout-summary">Resumo do pedido</h2>
          <strong>{listing.book.title}</strong>
          <p>{listing.book.author}</p>
          <p>Vendido por {listing.owner.name}</p>
          <dl className="checkout-costs">
            <div>
              <dt>Livro · 1 unidade</dt>
              <dd>{price}</dd>
            </div>
            <div>
              <dt>Total</dt>
              <dd>{price}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
