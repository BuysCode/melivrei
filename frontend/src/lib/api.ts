export type ListingMode = "SALE" | "TRADE";
export type BookCondition = "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "DAMAGED";
export type ListingStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "IN_NEGOTIATION"
  | "UNAVAILABLE"
  | "COMPLETED"
  | "CANCELLED";

export type Listing = {
  id: string;
  ownerId: string;
  description: string;
  condition: BookCondition;
  mode: ListingMode;
  price: string | number | null;
  status: ListingStatus;
  createdAt: string;
  book: {
    title: string;
    author: string;
    genre: string | null;
    isbn: string | null;
  };
  images: { id: string; url: string; altText: string | null }[];
  owner: { id: string; name: string };
};

export type Negotiation = {
  id: string;
  status: string;
  type: ListingMode;
  listing: Listing;
  tradeOffer?: {
    message: string | null;
    status: string;
    offeredListing?: Listing;
  } | null;
  payment?: { status: string; amount: string | number } | null;
  auditEvents?: { id: string; action: string; createdAt: string }[];
};

export const apiBase = (
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000"
).replace(/\/$/, "");

export async function readApi<T>(path: string, cookie?: string): Promise<T> {
  const response = await fetch(`${apiBase}/api${path}`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error(`API ${response.status}`);
  return response.json() as Promise<T>;
}

export async function getListings(
  filters: { search?: string; mode?: ListingMode } = {},
) {
  const query = new URLSearchParams();
  if (filters.search) query.set("search", filters.search);
  if (filters.mode) query.set("mode", filters.mode);
  const suffix = query.size ? `?${query}` : "";
  return readApi<Listing[]>(`/listings${suffix}`);
}

export function formatPrice(price: Listing["price"]) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(price ?? 0));
}

export const conditionLabels: Record<BookCondition, string> = {
  NEW: "Novo",
  LIKE_NEW: "Como novo",
  GOOD: "Bom estado",
  FAIR: "Estado regular",
  DAMAGED: "Com marcas de uso",
};

export async function browserApi<T>(
  path: string,
  init: RequestInit,
): Promise<T> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/api${path}`,
    {
      ...init,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...init.headers },
    },
  );
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body?.message;
    throw new Error(
      Array.isArray(message)
        ? message.join(" ")
        : typeof message === "string"
          ? message
          : "Não foi possível concluir a solicitação. Tente novamente.",
    );
  }
  return body as T;
}
