"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice } from "@/lib/api";
import { currentUser, decideNegotiation, useDemoStore } from "@/lib/demo-store";

const statuses: Record<string, string> = {
  PENDING: "Aguardando resposta",
  PENDING_PAYMENT: "Aguardando pagamento",
  APPROVED: "Aprovada",
  REJECTED: "Recusada",
  CANCELLED: "Cancelada",
  COMPLETED: "Concluída",
};
const events: Record<string, string> = {
  PURCHASE_STARTED: "Compra iniciada",
  TRADE_PROPOSED: "Proposta de troca enviada",
  TRADE_ACCEPTED: "Troca aceita",
  TRADE_REJECTED: "Troca recusada",
  PAYMENT_APPROVED_DEMO: "Pagamento simulado como aprovado",
  NEGOTIATION_CANCELLED: "Negociação cancelada",
  NEGOTIATION_COMPLETED: "Negociação concluída",
};
export function DemoNegotiationPage({ id }: { id: string }) {
  const store = useDemoStore();
  const user = currentUser(store);
  const negotiation = store.negotiations.find((item) => item.id === id);
  const listing = store.listings.find(
    (item) => item.id === negotiation?.listingId,
  );
  const offered = store.listings.find(
    (item) => item.id === negotiation?.offeredListingId,
  );
  const buyer = store.users.find((item) => item.id === negotiation?.buyerId);
  const [error, setError] = useState("");
  if (!user)
    return (
      <div className="shell negotiation-page state-panel">
        <h1>Entre para acompanhar a negociação.</h1>
        <Link
          className="button"
          href={`/entrar?voltar=${encodeURIComponent(`/negociacoes/${id}`)}`}
        >
          Entrar
        </Link>
      </div>
    );
  if (
    !negotiation ||
    !listing ||
    (user.id !== negotiation.buyerId && user.id !== listing.ownerId)
  )
    return (
      <div className="shell state-panel page-error">
        <h1>Negociação não encontrada.</h1>
        <Link href="/minha-conta" className="text-link">
          Ir para minha conta
        </Link>
      </div>
    );
  const seller = user.id === listing.ownerId;
  const act = (action: "accept" | "reject" | "pay" | "cancel" | "complete") => {
    setError("");
    try {
      decideNegotiation(id, action);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível atualizar a negociação.",
      );
    }
  };
  return (
    <div className="shell negotiation-page">
      <Link className="quiet-link" href="/minha-conta">
        ← Minhas negociações
      </Link>
      <h1>
        {negotiation.type === "SALE"
          ? seller
            ? "Venda do seu livro"
            : "Sua compra"
          : seller
            ? "Proposta recebida"
            : "Sua proposta de troca"}
      </h1>
      <p>
        <Link className="text-link" href={`/livros/${listing.id}`}>
          {listing.book.title}
        </Link>
        , de {listing.book.author}
      </p>
      <span className="status">{statuses[negotiation.status]}</span>
      <section>
        <h2>Resumo</h2>
        <p>
          {negotiation.type === "SALE"
            ? `${buyer?.name} iniciou uma compra por ${formatPrice(listing.price)}.`
            : `${buyer?.name} ofereceu ${offered?.book.title ?? "um livro"} em troca.`}
        </p>
        {negotiation.message && <p>“{negotiation.message}”</p>}
      </section>
      <section>
        <h2>Estado atual</h2>
        <p>
          {negotiation.status === "PENDING_PAYMENT"
            ? "Aguardando pagamento simulado do comprador. Nenhuma cobrança real será feita."
            : negotiation.status === "PENDING"
              ? "A proposta aguarda a decisão do proprietário."
              : negotiation.status === "APPROVED"
                ? "Negociação aprovada. As pessoas podem combinar a entrega fora da plataforma."
                : negotiation.status === "COMPLETED"
                  ? "Negociação concluída."
                  : negotiation.status === "REJECTED"
                    ? "A proposta foi recusada e os livros voltaram a ficar disponíveis."
                    : "Negociação cancelada e livro liberado."}
        </p>
      </section>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="negotiation-actions">
        {negotiation.status === "PENDING_PAYMENT" && !seller && (
          <button className="button" type="button" onClick={() => act("pay")}>
            Simular pagamento aprovado
          </button>
        )}
        {negotiation.status === "PENDING" && seller && (
          <>
            <button
              className="button"
              type="button"
              onClick={() => act("accept")}
            >
              Aceitar troca
            </button>
            <button
              className="text-button"
              type="button"
              onClick={() => act("reject")}
            >
              Recusar proposta
            </button>
          </>
        )}
        {(negotiation.status === "PENDING" ||
          negotiation.status === "PENDING_PAYMENT") &&
          !seller && (
            <button
              className="text-button"
              type="button"
              onClick={() => act("cancel")}
            >
              Cancelar negociação
            </button>
          )}
        {negotiation.status === "APPROVED" && seller && (
          <button
            className="button"
            type="button"
            onClick={() => act("complete")}
          >
            Marcar como concluída
          </button>
        )}
      </div>
      <section>
        <h2>Histórico</h2>
        <ol>
          {negotiation.auditEvents.map((item) => (
            <li key={item.id}>
              <strong>{events[item.action] ?? item.action}</strong>
              <br />
              <small>
                {new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(item.createdAt))}
              </small>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
