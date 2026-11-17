import type { Metadata } from "next";
import { Catalog } from "@/components/demo-listings";
export const metadata: Metadata = {
  title: "Explorar livros",
  description: "Explore livros usados disponíveis para venda ou troca.",
};
export default function Page() {
  return <Catalog />;
}
