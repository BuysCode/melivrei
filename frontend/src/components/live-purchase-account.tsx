"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { browserApi, getMyListings, type Listing } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { ListingCard } from "./listing-card";

type NegotiationRow = {
  id: string;
  type: "SALE" | "TRADE";
  status: string;
  listing: { ownerId: string; book: { title: string } };
};

const statusLabels: Record<string, string> = {
  AVAILABLE: "Disponível",
  RESERVED: "Reservado",
  IN_NEGOTIATION: "Em negociação",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  PENDING: "Aguardando resposta",
  PENDING_PAYMENT: "Aguardando pagamento",
  APPROVED: "Aprovada",
  REJECTED: "Recusada",
};

export function LivePurchaseAccount() {
  const session = authClient.useSession();
  const userId = session.data?.user.id;
  const [negotiations, setNegotiations] = useState<NegotiationRow[] | null>(
    null,
  );
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    const options = { signal: controller.signal };
    browserApi<NegotiationRow[]>("/negotiations/purchases", options)
      .then((rows) => {
        if (!controller.signal.aborted) setNegotiations(rows);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("Não foi possível carregar suas compras e vendas.");
      });
    getMyListings()
      .then((rows) => {
        if (!controller.signal.aborted) setListings(rows);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("Não foi possível carregar seus anúncios.");
      });
    browserApi<{ connected: boolean }>(
      "/payments/mercadopago/connection",
      options,
    )
      .then(({ connected }) => {
        if (!controller.signal.aborted) setConnected(connected);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("Não foi possível consultar sua conta Mercado Pago.");
      });
    return () => controller.abort();
  }, [userId]);

  async function connect() {
    setBusy(true);
    setError("");
    try {
      const { authorizationUrl } = await browserApi<{
        authorizationUrl: string;
      }>("/payments/mercadopago/connect", {});
      window.location.assign(authorizationUrl);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível conectar sua conta.",
      );
      setBusy(false);
    }
  }

  if (session.isPending)
    return <div className="shell account-page">Carregando…</div>;
  if (!userId) {
    return (
      <div className="shell account-page">
        <h1>Entre para acessar sua conta</h1>
        <Link className="button" href="/entrar">
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="shell account-page">
      <div className="page-heading">
        <h1>Minha conta</h1>
      </div>
      <section className="form-panel">
        <h2>Receber por suas vendas</h2>
        {connected === true && <p>Conta Mercado Pago conectada.</p>}
        {connected === false && (
          <button
            className="button"
            type="button"
            disabled={busy}
            onClick={connect}
          >
            {busy ? "Conectando…" : "Conectar Mercado Pago"}
          </button>
        )}
        {connected === null && !error && <p>Consultando conexão…</p>}
      </section>
      <div className="account-section-heading">
        <h2>Meus anúncios</h2>
        <Link href="/anunciar" className="button button-small">
          Anunciar livro
        </Link>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {listings?.length ? (
        <div className="account-listings">
          {listings.map((listing) => (
            <div className="account-listing" key={listing.id}>
              <ListingCard listing={listing} />
              <div className="account-listing-actions">
                <span className="status">
                  {statusLabels[listing.status] ?? listing.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : listings ? (
        <div className="state-panel">
          <h3>Você ainda não anunciou livros.</h3>
          <Link href="/anunciar" className="text-link">
            Publicar o primeiro
          </Link>
        </div>
      ) : null}
      <div className="account-section-heading">
        <h2>Minhas negociações</h2>
      </div>
      {negotiations?.length ? (
        <div className="negotiation-list">
          {negotiations.map(({ id, listing, status, type }) => (
            <Link
              className="negotiation-row"
              key={id}
              href={`/negociacoes/${id}`}
            >
              <span>
                <strong>{listing.book.title}</strong>
                <small>
                  {type === "TRADE"
                    ? "Troca"
                    : listing.ownerId === userId
                      ? "Venda"
                      : "Compra"}
                </small>
              </span>
              <span className="status">{statusLabels[status] ?? status}</span>
            </Link>
          ))}
        </div>
      ) : negotiations ? (
        <div className="state-panel">
          <h3>Nenhuma negociação ainda.</h3>
          <Link href="/livros" className="text-link">
            Explorar o catálogo
          </Link>
        </div>
      ) : null}
    </div>
  );
}
