import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { legalDocuments } from "@/lib/legal-documents";

export const metadata: Metadata = { title: "Política de Privacidade" };

export default function PrivacyPolicyPage() {
  return <LegalDocument document={legalDocuments["politica-de-privacidade"]} />;
}
