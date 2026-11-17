import { EditListing } from "@/components/edit-listing";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditListing id={id} />;
}
