"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { type FormEvent, useEffect, useState } from "react";
import { browserApi, type Listing } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

type StripeElements = {
  create: (kind: "payment") => {
    mount: (selector: string) => void;
    destroy: () => void;
  };
};
type StripeClient = {
  elements: (options: {
    clientSecret: string;
    appearance: object;
  }) => StripeElements;
  confirmPayment: (options: {
    elements: StripeElements;
    confirmParams: { return_url: string };
    redirect: "if_required";
  }) => Promise<{ error?: { message?: string } }>;
};
declare global {
  interface Window {
    Stripe?: (key: string) => StripeClient;
  }
}
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

export function PurchaseOrTrade({ listing }: { listing: Listing }) {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [offers, setOffers] = useState<Listing[]>([]);
  const [clientSecret, setClientSecret] = useState("");
  const [negotiationId, setNegotiationId] = useState("");
  const [stripeReady, setStripeReady] = useState(false);
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [stripeClient, setStripeClient] = useState<StripeClient | null>(null);
  const [elements, setElements] = useState<StripeElements | null>(null);
  useEffect(() => {
    if (listing.mode !== "TRADE" || !session?.user) return;
    browserApi<Listing[]>("/listings", { method: "GET" })
      .then((all) =>
        setOffers(
          all.filter(
            (item) =>
              item.ownerId === session.user.id && item.id !== listing.id,
          ),
        ),
      )
      .catch(() =>
        setError("Não foi possível carregar seus livros para troca."),
      );
  }, [listing.id, listing.mode, session?.user]);
  useEffect(() => {
    if (!stripeReady || !clientSecret || !stripeKey || !window.Stripe) return;
    const stripe = window.Stripe(stripeKey);
    const instance = stripe.elements({
      clientSecret,
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#173D38",
          colorText: "#1D2926",
          colorBackground: "#FFFEFA",
          borderRadius: "5px",
        },
      },
    });
    const payment = instance.create("payment");
    payment.mount("#payment-element");
    setStripeClient(stripe);
    setElements(instance);
    setCheckoutReady(true);
    return () => {
      payment.destroy();
      setCheckoutReady(false);
    };
  }, [stripeReady, clientSecret]);
  async function purchase() {
    if (!stripeKey) {
      setError(
        "O pagamento ainda não está configurado. Informe a chave pública do Stripe no frontend.",
      );
      return;
    }
    setError("");
    setPending(true);
    try {
      const negotiation = await browserApi<{
        id: string;
        payment: { clientSecret: string };
      }>("/negotiations/purchases", {
        method: "POST",
        body: JSON.stringify({ listingId: listing.id }),
      });
      setNegotiationId(negotiation.id);
      setClientSecret(negotiation.payment.clientSecret);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível iniciar a compra.",
      );
    } finally {
      setPending(false);
    }
  }
  async function pay(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!stripeClient || !elements) return;
    setError("");
    setPending(true);
    const result = await stripeClient.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/negociacoes/${negotiationId}`,
      },
      redirect: "if_required",
    });
    if (result.error) {
      setError(
        result.error.message || "Não foi possível confirmar o pagamento.",
      );
      setPending(false);
      return;
    }
    router.push(`/negociacoes/${negotiationId}`);
    router.refresh();
  }
  async function trade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const data = new FormData(event.currentTarget);
    const offeredListingId = String(data.get("offeredListingId") ?? "");
    if (!offeredListingId) {
      setError("Selecione o livro que deseja oferecer.");
      setPending(false);
      return;
    }
    try {
      const negotiation = await browserApi<{ id: string }>(
        "/negotiations/trades",
        {
          method: "POST",
          body: JSON.stringify({
            listingId: listing.id,
            offeredListingId,
            message: String(data.get("message") ?? "").trim() || undefined,
          }),
        },
      );
      router.push(`/negociacoes/${negotiation.id}`);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível enviar a proposta.",
      );
    } finally {
      setPending(false);
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
  if (isPending)
    return <div className="action-box">Verificando sua conta…</div>;
  if (!session?.user)
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
  if (session.user.id === listing.ownerId)
    return (
      <div className="action-box">
        <h2>Este é o seu anúncio.</h2>
        <p>Seu livro está disponível no catálogo.</p>
      </div>
    );
  return (
    <div className="action-box">
      <h2>
        {listing.mode === "SALE" ? "Comprar este livro" : "Propor uma troca"}
      </h2>
      {listing.mode === "SALE" ? (
        clientSecret ? (
          <>
            <Script
              src="https://js.stripe.com/v3/"
              strategy="afterInteractive"
              onReady={() => setStripeReady(true)}
              onError={() =>
                setError(
                  "Não foi possível carregar o pagamento. Atualize a página e tente novamente.",
                )
              }
            />
            <p>
              Preencha o pagamento em ambiente seguro do Stripe. A compra só
              será confirmada após a validação pelo backend.
            </p>
            <form onSubmit={pay}>
              <div id="payment-element" className="stripe-mount" />
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="button"
                type="submit"
                disabled={!checkoutReady || pending}
              >
                {pending
                  ? "Confirmando…"
                  : checkoutReady
                    ? "Confirmar pagamento"
                    : "Carregando pagamento…"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p>
              O pagamento será processado pelo Stripe em ambiente de testes.
              Combine a entrega diretamente com o vendedor.
            </p>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="button"
              type="button"
              onClick={purchase}
              disabled={pending}
            >
              {pending ? "Iniciando…" : "Iniciar compra"}
            </button>
          </>
        )
      ) : (
        <>
          <p>Escolha um anúncio seu disponível para oferecer em troca.</p>
          {offers.length ? (
            <form onSubmit={trade} className="form-stack">
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
              <button className="button" type="submit" disabled={pending}>
                {pending ? "Enviando…" : "Enviar proposta"}
              </button>
            </form>
          ) : (
            <>
              <p>
                Você precisa ter um anúncio disponível antes de propor uma
                troca.
              </p>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
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
