import { getListings, liveCheckout } from "@/lib/api";
import type { Metadata } from "next";
import { Catalog } from "@/components/demo-listings";
export const metadata: Metadata = {
  title: "Explorar livros",
  description: "Explore livros usados disponíveis para venda ou troca.",
};
export default async function Page() {
  const listings = liveCheckout ? await getListings() : undefined;
  return <Catalog source={listings} />;
}
