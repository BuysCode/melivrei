import { LiveCheckout } from "@/components/live-checkout";
import { liveCheckout } from "@/lib/api";
import type { Metadata } from "next";
import { PurchaseCheckout } from "@/components/purchase-checkout";

export const metadata: Metadata = { title: "Finalizar compra" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return liveCheckout ? (
    <LiveCheckout key={id} id={id} checkout />
  ) : (
    <PurchaseCheckout id={id} />
  );
}
