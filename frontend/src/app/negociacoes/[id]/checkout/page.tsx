import type { Metadata } from "next";
import { LiveCheckout } from "@/components/live-checkout";

export const metadata: Metadata = { title: "Finalizar compra" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LiveCheckout key={id} id={id} checkout />;
}
