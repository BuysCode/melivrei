"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import type { Listing, ListingMode } from "@/lib/api";
import { currentUser, saveListing, useDemoStore } from "@/lib/demo-store";

export function ListingForm({ listing }: { listing?: Listing }) {
  const store = useDemoStore();
  const user = currentUser(store);
  const router = useRouter();
  const [mode, setMode] = useState<ListingMode>(listing?.mode ?? "SALE");
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
    try {
      const id = saveListing(
        {
          title: String(data.get("title") ?? "").trim(),
          author: String(data.get("author") ?? "").trim(),
          description: String(data.get("description") ?? "").trim(),
          condition: String(data.get("condition")) as Listing["condition"],
          mode,
          genre: String(data.get("genre") ?? "").trim(),
          isbn: String(data.get("isbn") ?? "").trim(),
          price: mode === "SALE" ? price : null,
          imageUrl,
          imageAlt: String(data.get("imageAlt") ?? "").trim(),
        },
        listing?.id,
      );
      router.push(`/livros/${id}`);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Não foi possível salvar o anúncio.",
      );
    } finally {
      setPending(false);
    }
  }
  if (!user)
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
            <input
              id="title"
              name="title"
              maxLength={200}
              required
              defaultValue={listing?.book.title}
            />
          </div>
          <div className="field">
            <label htmlFor="author">
              Autor <span aria-hidden="true">*</span>
            </label>
            <input
              id="author"
              name="author"
              maxLength={160}
              required
              defaultValue={listing?.book.author}
            />
          </div>
          <div className="field">
            <label htmlFor="genre">Gênero</label>
            <input
              id="genre"
              name="genre"
              maxLength={100}
              defaultValue={listing?.book.genre ?? ""}
            />
          </div>
          <div className="field">
            <label htmlFor="isbn">ISBN</label>
            <input
              id="isbn"
              name="isbn"
              maxLength={20}
              inputMode="numeric"
              defaultValue={listing?.book.isbn ?? ""}
            />
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
            defaultValue={listing?.description}
          />
        </div>
      </fieldset>
      <fieldset className="form-group">
        <legend>Como está o exemplar?</legend>
        <div className="field">
          <label htmlFor="condition">
            Condição <span aria-hidden="true">*</span>
          </label>
          <select
            id="condition"
            name="condition"
            required
            defaultValue={listing?.condition ?? "LIKE_NEW"}
          >
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
              defaultValue={listing?.price ?? ""}
            />
          </div>
        )}
      </fieldset>
      <fieldset className="form-group">
        <legend>Foto do livro</legend>
        <p className="field-hint">
          Informe a URL pública de uma foto. Sem foto, mostraremos uma capa
          ilustrada.
        </p>
        <div className="field">
          <label htmlFor="imageUrl">URL da imagem</label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            placeholder="https://…"
            defaultValue={listing?.images[0]?.url ?? ""}
          />
        </div>
        <div className="field">
          <label htmlFor="imageAlt">Descrição da imagem</label>
          <input
            id="imageAlt"
            name="imageAlt"
            placeholder="Ex.: Capa e lombada do exemplar"
            defaultValue={listing?.images[0]?.altText ?? ""}
          />
        </div>
      </fieldset>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button" type="submit" disabled={pending}>
        {pending
          ? "Salvando…"
          : listing
            ? "Salvar alterações"
            : "Publicar anúncio"}
      </button>
    </form>
  );
}
