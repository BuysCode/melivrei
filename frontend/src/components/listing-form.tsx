"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { browserApi, type Listing, type ListingMode } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

export function ListingForm() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [mode, setMode] = useState<ListingMode>("SALE");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const data = new FormData(event.currentTarget);
    const imageUrl = String(data.get("imageUrl") ?? "").trim();
    const price = Number(String(data.get("price") ?? "").replace(",", "."));
    if (mode === "SALE" && (!Number.isFinite(price) || price <= 0)) {
      setError("Informe um preço maior que zero para venda.");
      setPending(false);
      return;
    }
    const payload = {
      title: String(data.get("title") ?? "").trim(),
      author: String(data.get("author") ?? "").trim(),
      description: String(data.get("description") ?? "").trim(),
      condition: String(data.get("condition")),
      mode,
      genre: String(data.get("genre") ?? "").trim() || undefined,
      isbn: String(data.get("isbn") ?? "").trim() || undefined,
      price: mode === "SALE" ? price : undefined,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              altText: String(data.get("imageAlt") ?? "").trim() || undefined,
            },
          ]
        : [],
    };
    try {
      const listing = await browserApi<Listing>("/listings", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push(`/livros/${listing.id}`);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível publicar o anúncio.",
      );
    } finally {
      setPending(false);
    }
  }
  if (isPending)
    return <output className="page-loading">Verificando sua conta…</output>;
  if (!session?.user)
    return (
      <div className="state-panel">
        <h2>Entre para anunciar um livro.</h2>
        <p>É preciso ter uma conta para publicar um anúncio.</p>
        <Link className="button" href="/entrar?voltar=%2Fanunciar">
          Entrar
        </Link>
      </div>
    );
  return (
    <form onSubmit={submit} className="publish-form">
      <fieldset className="form-group">
        <legend>Sobre o livro</legend>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="title">
              Título <span aria-hidden="true">*</span>
            </label>
            <input id="title" name="title" maxLength={200} required />
          </div>
          <div className="field">
            <label htmlFor="author">
              Autor <span aria-hidden="true">*</span>
            </label>
            <input id="author" name="author" maxLength={160} required />
          </div>
          <div className="field">
            <label htmlFor="genre">Gênero</label>
            <input id="genre" name="genre" maxLength={100} />
          </div>
          <div className="field">
            <label htmlFor="isbn">ISBN</label>
            <input id="isbn" name="isbn" maxLength={20} inputMode="numeric" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="description">
            Descrição <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            maxLength={2000}
            required
            placeholder="Conte sobre esta edição e os sinais de uso."
          />
        </div>
      </fieldset>
      <fieldset className="form-group">
        <legend>Como está o exemplar?</legend>
        <div className="field">
          <label htmlFor="condition">
            Condição <span aria-hidden="true">*</span>
          </label>
          <select id="condition" name="condition" required>
            <option value="LIKE_NEW">Como novo</option>
            <option value="GOOD">Bom estado</option>
            <option value="FAIR">Estado regular</option>
            <option value="DAMAGED">Com marcas de uso</option>
            <option value="NEW">Novo</option>
          </select>
        </div>
      </fieldset>
      <fieldset className="form-group">
        <legend>Venda ou troca?</legend>
        <div className="choice-grid">
          <label className={mode === "SALE" ? "choice selected" : "choice"}>
            <input
              type="radio"
              name="mode"
              value="SALE"
              checked={mode === "SALE"}
              onChange={() => setMode("SALE")}
            />
            <strong>Vender</strong>
            <span>Defina um preço para este livro.</span>
          </label>
          <label className={mode === "TRADE" ? "choice selected" : "choice"}>
            <input
              type="radio"
              name="mode"
              value="TRADE"
              checked={mode === "TRADE"}
              onChange={() => setMode("TRADE")}
            />
            <strong>Trocar</strong>
            <span>Receba propostas de outros leitores.</span>
          </label>
        </div>
        {mode === "SALE" && (
          <div className="field price-field">
            <label htmlFor="price">
              Preço em reais <span aria-hidden="true">*</span>
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0.01"
              step="0.01"
              inputMode="decimal"
              required
            />
          </div>
        )}
      </fieldset>
      <fieldset className="form-group">
        <legend>Foto do livro</legend>
        <p className="field-hint">
          Por enquanto, informe o endereço público de uma foto. O envio direto
          de arquivos ainda não está disponível na API.
        </p>
        <div className="field">
          <label htmlFor="imageUrl">URL da imagem</label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            placeholder="https://…"
          />
        </div>
        <div className="field">
          <label htmlFor="imageAlt">Descrição da imagem</label>
          <input
            id="imageAlt"
            name="imageAlt"
            placeholder="Ex.: Capa e lombada do exemplar"
          />
        </div>
      </fieldset>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button" type="submit" disabled={pending}>
        {pending ? "Publicando…" : "Publicar anúncio"}
      </button>
    </form>
  );
}
