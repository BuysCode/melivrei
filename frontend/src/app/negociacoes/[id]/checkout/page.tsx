import type { Metadata } from "next";
import { PurchaseCheckout } from "@/components/purchase-checkout";

export const metadata: Metadata = { title: "Finalizar compra" };

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PurchaseCheckout id={id} />;
}
