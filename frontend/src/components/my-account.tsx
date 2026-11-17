"use client";

import Link from "next/link";
import { useState } from "react";
import {
  currentUser,
  removeListing,
  resetDemo,
  useDemoStore,
} from "@/lib/demo-store";
import { ListingCard } from "./listing-card";

const statusLabels: Record<string, string> = {
  AVAILABLE: "Disponível",
  RESERVED: "Reservado",
  IN_NEGOTIATION: "Em negociação",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  UNAVAILABLE: "Indisponível",
  PENDING: "Aguardando resposta",
  PENDING_PAYMENT: "Aguardando pagamento",
  APPROVED: "Aprovada",
  REJECTED: "Recusada",
};
export function MyAccount() {
  const store = useDemoStore();
  const user = currentUser(store);
  const [error, setError] = useState("");
  if (!user)
    return (
      <div className="shell account-page state-panel">
        <h1>Entre para ver sua conta.</h1>
        <Link className="button" href="/entrar?voltar=%2Fminha-conta">
          Entrar
        </Link>
      </div>
    );
  const listings = store.listings.filter((item) => item.ownerId === user.id);
  const negotiations = store.negotiations.filter(
    (item) =>
      item.buyerId === user.id ||
      store.listings.find((listing) => listing.id === item.listingId)
        ?.ownerId === user.id,
  );
  return (
    <div className="shell account-page">
      <div className="page-heading">
        <h1>Olá, {user.name.split(" ")[0]}.</h1>
        <p>Seus livros e suas negociações em um só lugar.</p>
        <button
          className="text-button"
          type="button"
          onClick={() => {
            resetDemo();
            window.location.assign("/");
          }}
        >
          Reiniciar dados da demonstração
        </button>
      </div>
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
      {listings.length ? (
        <div className="account-listings">
          {listings.map((listing) => (
            <div className="account-listing" key={listing.id}>
              <ListingCard listing={listing} />
              <div className="account-listing-actions">
                <span className="status">{statusLabels[listing.status]}</span>
                {listing.status === "AVAILABLE" && (
                  <>
                    <Link
                      className="text-link"
                      href={`/anunciar/${listing.id}`}
                    >
                      Editar
                    </Link>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(`Remover “${listing.book.title}”?`)
                        ) {
                          try {
                            removeListing(listing.id);
                            setError("");
                          } catch (cause) {
                            setError(
                              cause instanceof Error
                                ? cause.message
                                : "Não foi possível remover.",
                            );
                          }
                        }
                      }}
                    >
                      Remover
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="state-panel">
          <h3>Você ainda não anunciou livros.</h3>
          <Link href="/anunciar" className="text-link">
            Publicar o primeiro
          </Link>
        </div>
      )}
      <div className="account-section-heading">
        <h2>Minhas negociações</h2>
      </div>
      {negotiations.length ? (
        <div className="negotiation-list">
          {negotiations.map((item) => {
            const listing = store.listings.find(
              (entry) => entry.id === item.listingId,
            );
            return (
              <Link
                href={`/negociacoes/${item.id}`}
                className="negotiation-row"
                key={item.id}
              >
                <span>
                  <strong>{listing?.book.title ?? "Livro"}</strong>
                  <small>
                    {item.type === "SALE" ? "Compra" : "Troca"} ·{" "}
                    {item.buyerId === user.id
                      ? "Proposta enviada"
                      : "Proposta recebida"}
                  </small>
                </span>
                <span className="status">{statusLabels[item.status]}</span>
                <span aria-hidden="true">→</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="state-panel">
          <h3>Nenhuma negociação ainda.</h3>
          <Link href="/livros" className="text-link">
            Explorar o catálogo
          </Link>
        </div>
      )}
    </div>
  );
}
