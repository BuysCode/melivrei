import type { Metadata } from "next";
import { MyAccount } from "@/components/my-account";
export const metadata: Metadata = { title: "Minha conta" };
export default function Page() {
  return <MyAccount />;
}
