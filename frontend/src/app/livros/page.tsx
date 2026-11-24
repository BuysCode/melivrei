import type { Metadata } from "next";
import { Catalog } from "@/components/catalog";
import { getListings } from "@/lib/api";
export const metadata: Metadata = {
  title: "Explorar livros",
  description: "Explore livros usados disponíveis para venda ou troca.",
};
export default async function Page() {
  const listings = await getListings();
  return <Catalog listings={listings} />;
}
