"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { browserApi } from "@/lib/api";
export function TradeDecision({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function decide(action: "accept" | "reject") {
    setPending(true);
    setError("");
    try {
      await browserApi(`/negotiations/${id}/${action}`, { method: "PATCH" });
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível registrar sua decisão.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="action-box">
      <h2>Decidir proposta</h2>
      <p>
        Se aceitar, os dois anúncios continuarão reservados para esta troca.
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="hero-actions">
        <button
          className="button"
          type="button"
          disabled={pending}
          onClick={() => decide("accept")}
        >
          Aceitar troca
        </button>
        <button
          className="text-button"
          type="button"
          disabled={pending}
          onClick={() => decide("reject")}
        >
          Recusar proposta
        </button>
      </div>
    </div>
  );
}
