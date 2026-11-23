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
            <p>
              <strong>Mercado Pago</strong>
            </p>
            <p>
              Combine a entrega com o vendedor após a confirmação do pagamento.
            </p>
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="button button-wide"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Processando pagamento…" : `Pagar ${price}`}
          </button>
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
