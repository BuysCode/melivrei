import { LivePurchaseAccount } from "@/components/live-purchase-account";
import { liveCheckout } from "@/lib/api";
import type { Metadata } from "next";
import { MyAccount } from "@/components/my-account";
export const metadata: Metadata = { title: "Minha conta" };
export default function Page() {
  return liveCheckout ? <LivePurchaseAccount /> : <MyAccount />;
}
