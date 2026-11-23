import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { legalDocuments } from "@/lib/legal-documents";

export const metadata: Metadata = { title: "Trocas e devoluções" };

export default function ReturnsPolicyPage() {
  return <LegalDocument document={legalDocuments["trocas-e-devolucoes"]} />;
}
