import type { Metadata } from "next";
import { LegalDocument } from "@/components/legal-document";
import { legalDocuments } from "@/lib/legal-documents";

export const metadata: Metadata = { title: "Política de reembolso" };

export default function RefundPolicyPage() {
  return <LegalDocument document={legalDocuments["politica-de-reembolso"]} />;
}
