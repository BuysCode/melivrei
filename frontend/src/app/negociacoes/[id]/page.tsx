import type { Metadata } from "next";
import { DemoNegotiationPage } from "@/components/demo-negotiation";
export const metadata: Metadata = { title: "Acompanhar negociação" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DemoNegotiationPage id={id} />;
}
