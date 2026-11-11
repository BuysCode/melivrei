import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PurchaseOrTrade } from "@/components/purchase-or-trade";
import { conditionLabels, formatPrice, type Listing, readApi } from "@/lib/api";

type Props = { params: Promise<{ id: string }> };
async function findListing(id: string) {
  try {
    return await readApi<Listing>(`/listings/${encodeURIComponent(id)}`);
  } catch (error) {
    if (error instanceof Error && error.message === "API 404") return null;
    throw error;
  }
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await findListing(id).catch(() => null);
  return listing
    ? {
        title: `${listing.book.title}, de ${listing.book.author}`,
        description: listing.description.slice(0, 160),
      }
    : { title: "Livro não encontrado" };
}
export default async function BookDetail({ params }: Props) {
  const { id } = await params;
  const listing = await findListing(id);
  if (!listing) notFound();
  const image = listing.images[0];
  return (
    <div className="shell detail-page">
      <nav aria-label="Caminho da página" className="breadcrumbs">
        <Link href="/livros">Livros</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{listing.book.title}</span>
      </nav>
      <div className="detail-grid">
        <div className="detail-cover">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText || `Capa do livro ${listing.book.title}`}
              fill
              sizes="(max-width: 800px) 90vw, 42vw"
              unoptimized
              priority
            />
          ) : (
            <div className="cover-fallback">
              <span className="cover-rule" />
              <strong>{listing.book.title}</strong>
              <small>{listing.book.author}</small>
            </div>
          )}
        </div>
        <div className="detail-content">
          <div className="listing-meta">
            <span>{listing.mode === "TRADE" ? "Para troca" : "À venda"}</span>
            <span>{conditionLabels[listing.condition]}</span>
          </div>
          <h1>{listing.book.title}</h1>
          <p className="detail-author">de {listing.book.author}</p>
          <div className="detail-price">
            {listing.mode === "SALE"
              ? formatPrice(listing.price)
              : "Uma troca, outra leitura"}
          </div>
          <p className="detail-owner">Publicado por {listing.owner.name}</p>
          <div className="detail-description">
            <h2>Sobre este livro</h2>
            <p>{listing.description}</p>
          </div>
          <dl className="detail-facts">
            <div>
              <dt>Condição</dt>
              <dd>{conditionLabels[listing.condition]}</dd>
            </div>
            {listing.book.genre && (
              <div>
                <dt>Gênero</dt>
                <dd>{listing.book.genre}</dd>
              </div>
            )}
            {listing.book.isbn && (
              <div>
                <dt>ISBN</dt>
                <dd>{listing.book.isbn}</dd>
              </div>
            )}
          </dl>
          <PurchaseOrTrade listing={listing} />
        </div>
      </div>
    </div>
  );
}
