import Image from "next/image";
import Link from "next/link";
import { conditionLabels, formatPrice, type Listing } from "@/lib/api";

export function ListingCard({ listing }: { listing: Listing }) {
  const image = listing.images[0];
  return (
    <article className="listing-card">
      <Link
        href={`/livros/${listing.id}`}
        className="listing-cover"
        aria-label={`Ver ${listing.book.title}, de ${listing.book.author}`}
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.altText || `Capa do livro ${listing.book.title}`}
            fill
            sizes="(max-width: 680px) 50vw, (max-width: 1100px) 33vw, 25vw"
            unoptimized
          />
        ) : (
          <span className="cover-fallback" aria-hidden="true">
            <span className="cover-rule" />
            <strong>{listing.book.title}</strong>
            <small>{listing.book.author}</small>
          </span>
        )}
      </Link>
      <div className="listing-info">
        <div className="listing-meta">
          <span>{listing.mode === "TRADE" ? "Troca" : "Venda"}</span>
          <span>{conditionLabels[listing.condition]}</span>
        </div>
        <h3>
          <Link href={`/livros/${listing.id}`}>{listing.book.title}</Link>
        </h3>
        <p>{listing.book.author}</p>
        <strong className="listing-price">
          {listing.mode === "TRADE"
            ? "Proponha uma troca"
            : formatPrice(listing.price)}
        </strong>
      </div>
    </article>
  );
}
