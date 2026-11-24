import { BookDetail } from "@/components/book-detail";
import { type Listing, readApi } from "@/lib/api";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await readApi<Listing>(`/listings/${encodeURIComponent(id)}`);
  return <BookDetail listing={listing} />;
}
