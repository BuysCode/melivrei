import type { Metadata } from "next";
import { ListingForm } from "@/components/listing-form";
export const metadata: Metadata = { title: "Anunciar um livro" };
export default function Page() {
  return (
    <div className="shell publish-page">
      <div className="page-heading">
        <h1>Seu livro pode seguir viagem.</h1>
        <p>
          Conte os detalhes do exemplar para ajudar outro leitor a encontrá-lo.
        </p>
      </div>
      <ListingForm />
    </div>
  );
}
