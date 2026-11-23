"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { browserApi } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

type PurchaseRow = {
  id: string;
  listing: { ownerId: string; book: { title: string } };
};

export function LivePurchaseAccount() {
  const session = authClient.useSession();
  const userId = session.data?.user.id;
  const [purchases, setPurchases] = useState<PurchaseRow[] | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    const options = { signal: controller.signal };
    browserApi<PurchaseRow[]>("/negotiations/purchases", options)
      .then((rows) => {
        if (!controller.signal.aborted) setPurchases(rows);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError("Não foi possível carregar suas compras e vendas.");
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
    return (
      <div className="shell account-page" role="status">
        Carregando…
      </div>
    );
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
        {connected === null && !error && (
          <p role="status">Consultando conexão…</p>
        )}
      </section>
      <div className="account-section-heading">
        <h2>Minhas compras e vendas</h2>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {purchases?.length ? (
        <div className="negotiation-list">
          {purchases.map(({ id, listing }) => (
            <Link
              className="negotiation-row"
              key={id}
              href={`/negociacoes/${id}`}
            >
              <strong>{listing.book.title}</strong>
              <span>{listing.ownerId === userId ? "Venda" : "Compra"}</span>
            </Link>
          ))}
        </div>
      ) : (
        purchases && <p>Você ainda não tem compras ou vendas.</p>
      )}
    </div>
  );
}
