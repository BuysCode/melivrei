import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ external_reference?: string | string[] }>;
}) {
  const { external_reference: id } = await searchParams;
  if (
    typeof id === "string" &&
    /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)
  ) {
    redirect(`/negociacoes/${id}`);
  }
  redirect("/minha-conta");
}
