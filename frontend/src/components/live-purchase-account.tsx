"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
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
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [contactLoaded, setContactLoaded] = useState(false);
  const [saved, setSaved] = useState(false);
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
    browserApi<{ whatsappNumber: string | null }>(
      "/negotiations/contact-profile",
      options,
    )
      .then(({ whatsappNumber }) => {
        if (!controller.signal.aborted) {
          setWhatsappNumber(whatsappNumber ?? "");
          setContactLoaded(true);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError(
            "Não foi possível carregar seu WhatsApp. Atualize a página para tentar novamente.",
          );
      });
    return () => controller.abort();
  }, [userId]);

  async function saveContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setSaved(false);
    setError("");
    try {
      await browserApi("/negotiations/contact-profile", {
        method: "PATCH",
        body: JSON.stringify({
          whatsappNumber: whatsappNumber.replace(/\D/g, ""),
        }),
      });
      setSaved(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível salvar seu WhatsApp.",
      );
    } finally {
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
        <h2>Contato para suas negociações</h2>
        <p>
          Cadastre seu WhatsApp para aceitar propostas de venda ou troca. O
          contato só será liberado ao interessado depois do seu aceite.
        </p>
        <form className="form-stack" onSubmit={saveContact}>
          <div className="field">
            <label htmlFor="whatsappNumber">
              WhatsApp com código do país e DDD
            </label>
            <input
              id="whatsappNumber"
              name="whatsappNumber"
              type="tel"
              autoComplete="tel"
              placeholder="Ex.: +55 51 99999-9999"
              required
              maxLength={25}
              disabled={!contactLoaded || busy}
              value={whatsappNumber}
              onChange={(event) => {
                setWhatsappNumber(event.target.value);
                setSaved(false);
              }}
            />
          </div>
          <button
            className="button"
            type="submit"
            disabled={busy || !contactLoaded}
          >
            {busy ? "Salvando…" : "Salvar WhatsApp"}
          </button>
          {saved && <output>WhatsApp salvo.</output>}
        </form>
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
