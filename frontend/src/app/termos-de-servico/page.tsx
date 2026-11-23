import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { legalDocuments } from "@/lib/legal-documents";

export const metadata: Metadata = { title: "Termos de serviço" };

export default function ServiceTermsPage() {
  return <LegalDocument document={legalDocuments["termos-de-servico"]} />;
}
