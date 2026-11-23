"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import type { Listing } from "@/lib/api";
import { currentUser, startNegotiation, useDemoStore } from "@/lib/demo-store";

export function PurchaseOrTrade({ listing }: { listing: Listing }) {
  const store = useDemoStore();
  const user = currentUser(store);
  const router = useRouter();
  const [error, setError] = useState("");
  const offers = store.listings.filter(
    (item) =>
      item.ownerId === user?.id &&
      item.id !== listing.id &&
      item.status === "AVAILABLE",
  );
  function start(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setError("");
    try {
      const data = event ? new FormData(event.currentTarget) : null;
      const id = startNegotiation(
        listing.id,
        data ? String(data.get("offeredListingId")) : undefined,
        data ? String(data.get("message") ?? "").trim() : undefined,
      );
      router.push(`/negociacoes/${id}`);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível iniciar a negociação.",
      );
    }
  }
  if (listing.status !== "AVAILABLE")
    return (
      <div className="action-box">
        <h2>Este livro não está disponível.</h2>
        <Link className="text-link" href="/livros">
          Encontrar outro livro
        </Link>
      </div>
    );
  if (!user)
    return (
      <div className="action-box">
        <h2>Gostou deste livro?</h2>
        <p>
          Entre na sua conta para{" "}
          {listing.mode === "SALE" ? "iniciar a compra" : "propor uma troca"}.
        </p>
        <Link
          className="button"
          href={`/entrar?voltar=${encodeURIComponent(`/livros/${listing.id}`)}`}
        >
          Entrar para continuar
        </Link>
      </div>
    );
  if (user.id === listing.ownerId)
    return (
      <div className="action-box">
        <h2>Este é o seu anúncio.</h2>
        <p>Você pode editar ou remover este livro pela sua conta.</p>
        <Link className="button" href="/minha-conta">
          Gerenciar anúncio
        </Link>
      </div>
    );
  return (
    <div className="action-box">
      <h2>
        {listing.mode === "SALE" ? "Comprar este livro" : "Propor uma troca"}
      </h2>
      {listing.mode === "SALE" ? (
        <>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button type="button" className="button" onClick={() => start()}>
            Iniciar compra
          </button>
        </>
      ) : (
        <>
          <p>Escolha um anúncio seu disponível para oferecer em troca.</p>
          {offers.length ? (
            <form onSubmit={start} className="form-stack">
              <div className="field">
                <label htmlFor="offeredListingId">Seu livro</label>
                <select
                  id="offeredListingId"
                  name="offeredListingId"
                  required
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecione um livro
                  </option>
                  {offers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.book.title} — {item.book.author}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="message">Mensagem para o proprietário</label>
                <textarea
                  id="message"
                  name="message"
                  maxLength={500}
                  rows={3}
                />
              </div>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button className="button" type="submit">
                Enviar proposta
              </button>
            </form>
          ) : (
            <>
              <p>
                Você precisa ter um anúncio disponível antes de propor uma
                troca.
              </p>
              <Link className="button" href="/anunciar">
                Anunciar meu livro
              </Link>
            </>
          )}
        </>
      )}
    </div>
  );
}
