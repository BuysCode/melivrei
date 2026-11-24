"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import type { Listing, ListingMode } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { ListingCard } from "./listing-card";

export function RecentListings({ listings }: { listings: Listing[] }) {
  const recent = listings
    .filter((item) => item.status === "AVAILABLE")
    .slice(0, 4);
  return <ListingGrid listings={recent} />;
}

export function Catalog({ listings }: { listings: Listing[] }) {
  const session = authClient.useSession();
  const userId = session.data?.user.id;
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState<ListingMode | "">("");
  const [genre, setGenre] = useState("");
  const [condition, setCondition] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    mode: "",
    genre: "",
    condition: "",
    maxPrice: "",
  });
  const availableListings = listings.filter((item) => item.ownerId !== userId);
  const genres = [
    ...new Set(
      availableListings
        .map((item) => item.book.genre)
        .filter((item): item is string => Boolean(item)),
    ),
  ].sort();
  const results = availableListings.filter((item) => {
    if (item.status !== "AVAILABLE") return false;
    const needle = filters.search.toLocaleLowerCase("pt-BR");
    return (
      (!needle ||
        `${item.book.title} ${item.book.author}`
          .toLocaleLowerCase("pt-BR")
          .includes(needle)) &&
      (!filters.mode || item.mode === filters.mode) &&
      (!filters.genre || item.book.genre === filters.genre) &&
      (!filters.condition || item.condition === filters.condition) &&
      (!filters.maxPrice ||
        (item.mode === "SALE" &&
          Number(item.price) <= Number(filters.maxPrice)))
    );
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters({ search: search.trim(), mode, genre, condition, maxPrice });
  }

  function clear() {
    setSearch("");
    setMode("");
    setGenre("");
    setCondition("");
    setMaxPrice("");
    setFilters({
      search: "",
      mode: "",
      genre: "",
      condition: "",
      maxPrice: "",
    });
  }

  return (
    <div className="shell catalog-page">
      <div className="page-heading">
        <h1>Encontre sua próxima leitura.</h1>
        <p>Livros usados disponíveis para comprar ou trocar.</p>
      </div>
      <form className="catalog-search" onSubmit={submit}>
        <label htmlFor="search">Busque por título ou autor</label>
        <div className="search-row">
          <input
            id="search"
            type="search"
            placeholder="Qual livro você procura?"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            aria-label="Modalidade"
            value={mode}
            onChange={(event) =>
              setMode(event.target.value as ListingMode | "")
            }
          >
            <option value="">Venda e troca</option>
            <option value="SALE">Comprar</option>
            <option value="TRADE">Trocar</option>
          </select>
          <button className="button" type="submit">
            Buscar
          </button>
        </div>
        <div className="filter-row">
          <select
            aria-label="Gênero"
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
          >
            <option value="">Todos os gêneros</option>
            {genres.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <select
            aria-label="Condição"
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
          >
            <option value="">Todas as condições</option>
            <option value="NEW">Novo</option>
            <option value="LIKE_NEW">Como novo</option>
            <option value="GOOD">Bom estado</option>
            <option value="FAIR">Estado regular</option>
            <option value="DAMAGED">Com marcas de uso</option>
          </select>
          <input
            aria-label="Preço máximo em reais"
            type="number"
            min="0"
            step="0.01"
            placeholder="Preço máximo (R$)"
            value={maxPrice}
            onChange={(event) => setMaxPrice(event.target.value)}
          />
        </div>
      </form>
      <div className="results-heading">
        <h2>
          {results.length}{" "}
          {results.length === 1 ? "livro encontrado" : "livros encontrados"}
        </h2>
        <Link href="/anunciar" className="quiet-link">
          Anunciar um livro →
        </Link>
      </div>
      {results.length ? (
        <ListingGrid listings={results} />
      ) : (
        <div className="state-panel">
          <h3>Nenhum livro encontrado.</h3>
          <p>Tente outros filtros ou busque por outro título.</p>
          <button className="text-button" type="button" onClick={clear}>
            Limpar filtros
          </button>
        </div>
      )}
    </div>
  );
}

function ListingGrid({ listings }: { listings: Listing[] }) {
  return (
    <div className="listing-grid">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
