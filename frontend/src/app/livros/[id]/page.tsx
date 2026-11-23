import { BookDetail } from "@/components/book-detail";
import { liveCheckout, readApi, type Listing } from "@/lib/api";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = liveCheckout
    ? await readApi<Listing>(`/listings/${encodeURIComponent(id)}`)
    : undefined;
  return <BookDetail id={id} source={listing} />;
}
