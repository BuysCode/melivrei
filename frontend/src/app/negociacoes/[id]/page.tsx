import type { Metadata } from "next";
import { LiveNegotiation } from "@/components/live-negotiation";
export const metadata: Metadata = { title: "Acompanhar negociação" };
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LiveNegotiation key={id} id={id} />;
}
