"use client";
import Link from "next/link";
import { currentUser, useDemoStore } from "@/lib/demo-store";
import { ListingForm } from "./listing-form";
export function EditListing({ id }: { id: string }) {
  const store = useDemoStore();
  const listing = store.listings.find((item) => item.id === id);
  const user = currentUser(store);
  if (
    !listing ||
    listing.ownerId !== user?.id ||
    listing.status !== "AVAILABLE"
  )
    return (
      <div className="shell state-panel page-error">
        <h1>Anúncio indisponível para edição.</h1>
        <Link href="/minha-conta" className="text-link">
          Voltar à minha conta
        </Link>
      </div>
    );
  return (
    <div className="shell publish-page">
      <div className="page-heading">
        <h1>Editar anúncio.</h1>
        <p>Atualize os detalhes do seu livro.</p>
      </div>
      <ListingForm listing={listing} />
    </div>
  );
}
