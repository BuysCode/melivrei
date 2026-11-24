import type { Metadata } from "next";
import { LivePurchaseAccount } from "@/components/live-purchase-account";
export const metadata: Metadata = { title: "Minha conta" };
export default function Page() {
  return <LivePurchaseAccount />;
}
