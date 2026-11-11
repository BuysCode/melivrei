import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { TradeDecision } from "@/components/trade-decision";
import { readApi } from "@/lib/api";

type Data = {
  id: string;
  type: "SALE" | "TRADE";
  status: string;
  listing: { ownerId: string; book: { title: string; author: string } };
  tradeOffer?: {
    message: string | null;
    status: string;
    offeredListingId: string;
  } | null;
  payment?: { status: string; amount: string | number } | null;
  auditEvents?: { id: string; action: string; createdAt: string }[];
};
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
};
export const metadata: Metadata = { title: "Acompanhar negociação" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookie = (await headers()).get("cookie") ?? "";
  let negotiation: Data;
  try {
    negotiation = await readApi<Data>(
      `/negotiations/${encodeURIComponent(id)}`,
      cookie,
    );
  } catch (error) {
    if (error instanceof Error && error.message === "API 401")
      redirect(`/entrar?voltar=${encodeURIComponent(`/negociacoes/${id}`)}`);
    if (error instanceof Error && error.message === "API 404") notFound();
    throw error;
  }
  let userId = "";
  try {
    const session = await readApi<{ user: { id: string } }>(
      "/auth/get-session",
      cookie,
    );
    userId = session?.user?.id ?? "";
  } catch {
    /* The backend remains the authority for decisions. */
  }
  return (
    <div className="shell negotiation-page">
      <Link className="quiet-link" href="/livros">
        ← Voltar ao catálogo
      </Link>
      <h1>
        {negotiation.type === "SALE" ? "Sua compra" : "Sua proposta de troca"}
      </h1>
      <p>
        {negotiation.listing.book.title}, de {negotiation.listing.book.author}
      </p>
      <span className="status">
        {statuses[negotiation.status] ?? negotiation.status}
      </span>
      <section>
        <h2>Estado atual</h2>
        {negotiation.type === "SALE" ? (
          <p>
            {negotiation.payment?.status === "APPROVED"
              ? "Pagamento confirmado pelo Stripe. Combine a entrega diretamente com a outra pessoa."
              : negotiation.payment?.status === "REFUSED"
                ? "O pagamento foi recusado. O anúncio poderá voltar a ficar disponível."
                : "Aguardando confirmação do pagamento pelo Stripe. Esta página não confirma pagamentos por conta própria."}
          </p>
        ) : (
          <p>
            {negotiation.status === "PENDING"
              ? "A proposta foi enviada. O proprietário do livro pode aceitar ou recusar."
              : negotiation.status === "APPROVED"
                ? "A proposta foi aceita. Combine a entrega diretamente com a outra pessoa."
                : "Consulte o histórico abaixo para ver a última atualização."}
          </p>
        )}
      </section>
      {negotiation.tradeOffer?.message && (
        <section>
          <h2>Mensagem da proposta</h2>
          <p>{negotiation.tradeOffer.message}</p>
        </section>
      )}
      {negotiation.type === "TRADE" &&
        negotiation.status === "PENDING" &&
        userId === negotiation.listing.ownerId && <TradeDecision id={id} />}
      <section>
        <h2>Histórico</h2>
        {negotiation.auditEvents?.length ? (
          <ol>
            {negotiation.auditEvents.map((event) => (
              <li key={event.id}>
                <strong>{events[event.action] ?? event.action}</strong>
                <br />
                <small>
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(event.createdAt))}
                </small>
              </li>
            ))}
          </ol>
        ) : (
          <p>Nenhum evento registrado ainda.</p>
        )}
      </section>
    </div>
  );
}
