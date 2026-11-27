"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";
import { browserApi, getMyListings, type Listing } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

export function ListingActions({ listing }: { listing: Listing }) {
  const session = authClient.useSession();
  const router = useRouter();
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const user = session.data?.user;

  useEffect(() => {
    if (!user || listing.mode !== "TRADE") return;
    setLoadingListings(true);
    getMyListings()
      .then((items) =>
        setMyListings(
          items.filter(
            (item) => item.id !== listing.id && item.status === "AVAILABLE",
          ),
        ),
      )
      .catch((cause: Error) => setError(cause.message))
      .finally(() => setLoadingListings(false));
  }, [listing.id, listing.mode, user]);

  if (listing.status !== "AVAILABLE")
    return (
      <div className="action-box">
        <h2>Este livro não está disponível.</h2>
        <Link className="text-link" href="/livros">
          Encontrar outro livro
        </Link>
      </div>
    );
  if (session.isPending)
    return (
      <div className="action-box">
        <p>Carregando sua conta…</p>
      </div>
    );
  if (!user)
    return (
      <div className="action-box">
        <h2>Gostou deste livro?</h2>
        <p>
          Entre para{" "}
          {listing.mode === "SALE"
            ? "enviar uma proposta de compra"
            : "propor uma troca"}
          .
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
        <p>Você pode gerenciá-lo pela sua conta.</p>
        <Link className="button" href="/minha-conta">
          Gerenciar anúncio
        </Link>
      </div>
    );

  async function startPurchase() {
    setBusy(true);
    setError("");
    try {
      const purchase = await browserApi<{ id: string }>(
        "/negotiations/purchases",
        {
          method: "POST",
          body: JSON.stringify({ listingId: listing.id }),
        },
      );
      router.push(`/negociacoes/${purchase.id}`);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível enviar a proposta.",
      );
      setBusy(false);
    }
  }

  async function proposeTrade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const trade = await browserApi<{ id: string }>("/negotiations/trades", {
        method: "POST",
        body: JSON.stringify({
          listingId: listing.id,
          offeredListingId: String(data.get("offeredListingId")),
          message: String(data.get("message") ?? "").trim() || undefined,
        }),
      });
      router.push(`/negociacoes/${trade.id}`);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível enviar a proposta.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="action-box">
      <h2>{listing.mode === "SALE" ? "Propor compra" : "Propor uma troca"}</h2>
      <p>
        O contato com o anunciante será liberado após ele aceitar sua proposta.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {listing.mode === "SALE" ? (
        <button
          className="button"
          type="button"
          disabled={busy}
          onClick={startPurchase}
        >
          {busy ? "Enviando proposta…" : "Enviar proposta de compra"}
        </button>
      ) : loadingListings ? (
        <p>Carregando seus anúncios…</p>
      ) : myListings.length ? (
        <form className="form-stack" onSubmit={proposeTrade}>
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
              {myListings.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.book.title} — {item.book.author}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="message">Mensagem para o proprietário</label>
            <textarea id="message" name="message" maxLength={500} rows={3} />
          </div>
          <button className="button" type="submit" disabled={busy}>
            {busy ? "Enviando proposta…" : "Enviar proposta"}
          </button>
        </form>
      ) : (
        <>
          <p>
            Você precisa ter um anúncio disponível antes de propor uma troca.
          </p>
          <Link className="button" href="/anunciar">
            Anunciar meu livro
          </Link>
        </>
      )}
    </div>
  );
}
