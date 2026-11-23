import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { legalDocuments } from "@/lib/legal-documents";

export const metadata: Metadata = { title: "Termos de Uso" };

export default function TermsOfUsePage() {
  return <LegalDocument document={legalDocuments["termos-de-uso"]} />;
}
