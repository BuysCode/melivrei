"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { browserApi, formatPrice, type Negotiation } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

const statusLabels: Record<string, string> = {
  PENDING: "Aguardando resposta do anunciante",
  APPROVED: "Proposta aceita",
  REJECTED: "Proposta recusada",
  CANCELLED: "Negociação cancelada",
  COMPLETED: "Negociação concluída",
};

export function LiveNegotiation({ id }: { id: string }) {
  const session = authClient.useSession();
  const userId = session.data?.user.id;
  const [result, setResult] = useState<{
    userId: string;
    negotiation: Negotiation;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [contact, setContact] = useState<{
    userId: string;
    url: string;
  } | null>(null);
  const path = `/negociacoes/${encodeURIComponent(id)}`;
  const negotiation =
    result && result.userId === userId ? result.negotiation : null;

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    browserApi<Negotiation>(
      `/negotiations/${encodeURIComponent(id)}?refresh=${attempt}`,
      {
        signal: controller.signal,
      },
    )
      .then((negotiation) => {
        if (!controller.signal.aborted) setResult({ userId, negotiation });
      })
      .catch((cause: Error) => {
        if (!controller.signal.aborted) setError(cause.message);
      });
    return () => controller.abort();
  }, [id, userId, attempt]);

  useEffect(() => {
    if (!userId || !negotiation?.canContact) return;
    const controller = new AbortController();
    browserApi<{ url: string }>(
      `/negotiations/${encodeURIComponent(id)}/contact?refresh=${attempt}`,
      { signal: controller.signal },
    )
      .then(({ url }) => {
        if (!controller.signal.aborted) setContact({ userId, url });
      })
      .catch((cause: Error) => {
        if (!controller.signal.aborted) setError(cause.message);
      });
    return () => controller.abort();
  }, [id, userId, negotiation?.canContact, attempt]);

  function refresh() {
    setError("");
    setAttempt((current) => current + 1);
  }

  async function decide(action: "accept" | "reject") {
    setBusy(true);
    setError("");
    try {
      await browserApi(`/negotiations/${encodeURIComponent(id)}/${action}`, {
        method: "PATCH",
      });
      refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível responder à proposta.",
      );
    } finally {
      setBusy(false);
    }
  }

  if (session.isPending || (userId && !negotiation && !error))
    return <div className="shell negotiation-page">Carregando negociação…</div>;
  if (!userId)
    return (
      <div className="shell negotiation-page">
        <h1>Entre para acessar sua negociação</h1>
        <Link
          className="button"
          href={`/entrar?voltar=${encodeURIComponent(path)}`}
        >
          Entrar
        </Link>
      </div>
    );
  if (!negotiation)
    return (
      <div className="shell negotiation-page">
        <h1>Negociação indisponível</h1>
        <p className="form-error" role="alert">
          {error}
        </p>
        <button className="button" type="button" onClick={refresh}>
          Tentar novamente
        </button>
        <Link className="text-link" href="/minha-conta">
          Minhas negociações
        </Link>
      </div>
    );

  const { listing, tradeOffer } = negotiation;
  const isOwner = listing.ownerId === userId;
  const canDecide = isOwner && negotiation.status === "PENDING";
  const contactUrl =
    contact?.userId === userId && negotiation.canContact ? contact.url : null;

  return (
    <div className="shell negotiation-page">
      <Link className="quiet-link" href="/minha-conta">
        ← Minhas negociações
      </Link>
      <h1>
        {negotiation.type === "TRADE"
          ? "Proposta de troca"
          : "Proposta de compra"}
      </h1>
      <div className="negotiation-grid">
        <div className="form-panel form-stack">
          <h2>{listing.book.title}</h2>
          <span className="status">
            {statusLabels[negotiation.status] ?? negotiation.status}
          </span>
          {tradeOffer?.offeredListing && (
            <p>
              Livro oferecido:{" "}
              <strong>{tradeOffer.offeredListing.book.title}</strong>, de{" "}
              {tradeOffer.offeredListing.book.author}.
            </p>
          )}
          {tradeOffer?.message && <p>Mensagem: {tradeOffer.message}</p>}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {canDecide && (
            <>
              <p>
                Ao aceitar, seu WhatsApp será liberado ao interessado para
                combinar a venda ou troca. Cadastre o número em{" "}
                <Link className="text-link" href="/minha-conta">
                  Minha conta
                </Link>
                .
              </p>
              <div className="hero-actions">
                <button
                  className="button"
                  type="button"
                  disabled={busy}
                  onClick={() => void decide("accept")}
                >
                  {busy ? "Respondendo…" : "Aceitar proposta"}
                </button>
                <button
                  className="text-button"
                  type="button"
                  disabled={busy}
                  onClick={() => void decide("reject")}
                >
                  Recusar proposta
                </button>
              </div>
            </>
          )}
          {!isOwner && negotiation.status === "PENDING" && (
            <p>
              O botão de contato será liberado quando o anunciante aceitar sua
              proposta.
            </p>
          )}
          {contactUrl && (
            <a
              className="button"
              href={contactUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Entrar em contato
            </a>
          )}
          {isOwner &&
            negotiation.status === "APPROVED" &&
            negotiation.auditEvents?.some((event) =>
              ["SALE_ACCEPTED", "TRADE_ACCEPTED"].includes(event.action),
            ) && (
              <p>
                Proposta aceita. O interessado já pode entrar em contato pelo
                seu WhatsApp.
              </p>
            )}
          <p>
            A conversa, a entrega e qualquer pagamento são combinados
            diretamente entre os participantes, fora do MeLivrei.
          </p>
          <button className="text-button" type="button" onClick={refresh}>
            Atualizar negociação
          </button>
        </div>
        <aside className="form-panel">
          <h2>Livro solicitado</h2>
          <strong>{listing.book.title}</strong>
          <p>{listing.book.author}</p>
          <p>Publicado por {listing.owner.name}</p>
          {listing.mode === "SALE" && (
            <p>Preço anunciado: {formatPrice(listing.price)}</p>
          )}
        </aside>
      </div>
    </div>
  );
}
