import type { Metadata } from "next";
import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { getListings, type Listing, type ListingMode } from "@/lib/api";

export const metadata: Metadata = {
  title: "Explorar livros",
  description:
    "Pesquise livros usados disponíveis para venda ou troca no MeLivrei.",
};

type Query = { search?: string; mode?: string };
export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const params = await searchParams;
  const search =
    typeof params.search === "string" ? params.search.trim().slice(0, 100) : "";
  const mode: ListingMode | undefined =
    params.mode === "SALE" || params.mode === "TRADE" ? params.mode : undefined;
  let listings: Listing[] | null = null;
  try {
    listings = await getListings({ search, mode });
  } catch {
    /* Recovery state below. */
  }
  return (
    <div className="shell catalog-page">
      <div className="page-heading">
        <h1>Encontre sua próxima leitura.</h1>
        <p>Livros usados disponíveis para comprar ou trocar.</p>
      </div>
      <form className="catalog-search" action="/livros" method="get">
        <label htmlFor="search">Busque por título ou autor</label>
        <div className="search-row">
          <input
            id="search"
            name="search"
            type="search"
            placeholder="Qual livro você procura?"
            defaultValue={search}
          />
          <select name="mode" aria-label="Modalidade" defaultValue={mode ?? ""}>
            <option value="">Venda e troca</option>
            <option value="SALE">Comprar</option>
            <option value="TRADE">Trocar</option>
          </select>
          <button className="button" type="submit">
            Buscar
          </button>
        </div>
      </form>
      <div className="results-heading">
        <h2>
          {listings === null
            ? "Catálogo indisponível"
            : `${listings.length} ${listings.length === 1 ? "livro encontrado" : "livros encontrados"}`}
        </h2>
        <Link href="/anunciar" className="quiet-link">
          Anunciar um livro <span aria-hidden="true">→</span>
        </Link>
      </div>
      {listings === null ? (
        <div className="state-panel">
          <h3>Não conseguimos acessar o catálogo.</h3>
          <p>Verifique a conexão com a API e atualize a página.</p>
        </div>
      ) : listings.length ? (
        <div className="listing-grid">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="state-panel">
          <h3>Nenhum livro encontrado.</h3>
          <p>Tente outro título, autor ou modalidade.</p>
          <Link className="text-link" href="/livros">
            Limpar busca
          </Link>
        </div>
      )}
    </div>
  );
}
