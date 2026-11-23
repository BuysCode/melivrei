"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserApi, type Listing } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

export function StartPurchase({ listing }: { listing: Listing }) {
  const session = authClient.useSession();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (listing.mode !== "SALE") return null;
  if (
    listing.status !== "AVAILABLE" ||
    listing.ownerId === session.data?.user.id
  )
    return null;

  async function start() {
    setBusy(true);
    setError("");
    try {
      const purchase = await browserApi<{ id: string }>(
        "/negotiations/purchases",
        {
          method: "POST",
          body: JSON.stringify({ listingId: listing.id, deferCheckout: true }),
        },
      );
      router.push(`/negociacoes/${purchase.id}`);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível iniciar a compra.",
      );
      setBusy(false);
    }
  }

  return (
    <div className="action-box">
      <h2>Comprar este livro</h2>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {session.isPending ? (
        <p role="status">Carregando sua conta…</p>
      ) : session.data?.user ? (
        <button
          className="button"
          type="button"
          disabled={busy}
          onClick={start}
        >
          {busy ? "Iniciando compra…" : "Iniciar compra"}
        </button>
      ) : (
        <Link
          className="button"
          href={`/entrar?voltar=${encodeURIComponent(`/livros/${listing.id}`)}`}
        >
          Entrar para comprar
        </Link>
      )}
    </div>
  );
}
