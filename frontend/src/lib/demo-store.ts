"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { BookCondition, Listing, ListingMode } from "./api";

type User = { id: string; name: string; email: string };
type Event = { id: string; action: string; createdAt: string };
export type DemoNegotiation = {
  id: string;
  type: ListingMode;
  status:
    | "PENDING"
    | "PENDING_PAYMENT"
    | "APPROVED"
    | "REJECTED"
    | "CANCELLED"
    | "COMPLETED";
  listingId: string;
  buyerId: string;
  offeredListingId?: string;
  message?: string;
  paymentStatus?: "PENDING" | "APPROVED" | "REFUSED";
  auditEvents: Event[];
};
type State = {
  users: User[];
  currentUserId: string | null;
  listings: Listing[];
  negotiations: DemoNegotiation[];
};
const users: User[] = [
  { id: "ana", name: "Ana Martins", email: "ana@melivrei.demo" },
  { id: "bruno", name: "Bruno Costa", email: "bruno@melivrei.demo" },
  { id: "camila", name: "Camila Rocha", email: "camila@melivrei.demo" },
];
const makeListing = (
  id: string,
  ownerId: string,
  title: string,
  author: string,
  genre: string,
  mode: ListingMode,
  price: number | null,
  condition: BookCondition,
  description: string,
  status: Listing["status"] = "AVAILABLE",
): Listing => ({
  id,
  ownerId,
  description,
  condition,
  mode,
  price,
  status,
  createdAt: "2026-11-10T12:00:00.000Z",
  book: { title, author, genre, isbn: null },
  images: [
    {
      id: `${id}-cover`,
      url: `/demo-covers/${id}.webp`,
      altText: `Ilustração original para ${title}`,
    },
  ],
  owner: {
    id: ownerId,
    name: users.find((user) => user.id === ownerId)?.name ?? "Leitor",
  },
});
const seed: State = {
  users,
  currentUserId: "ana",
  listings: [
    makeListing(
      "livro-1",
      "bruno",
      "A vida invisível de Addie LaRue",
      "V. E. Schwab",
      "Fantasia",
      "SALE",
      32,
      "GOOD",
      "Edição bem cuidada, com leves marcas na lombada. Páginas limpas e prontas para uma nova leitura.",
    ),
    makeListing(
      "livro-2",
      "camila",
      "Torto Arado",
      "Itamar Vieira Junior",
      "Ficção brasileira",
      "TRADE",
      null,
      "LIKE_NEW",
      "Exemplar em ótimo estado. Gostaria de trocar por ficção brasileira ou literatura contemporânea.",
    ),
    makeListing(
      "livro-3",
      "bruno",
      "O Hobbit",
      "J. R. R. Tolkien",
      "Fantasia",
      "SALE",
      39.9,
      "GOOD",
      "Capa conservada e miolo íntegro. Uma ótima porta de entrada para a Terra-média.",
    ),
    makeListing(
      "livro-4",
      "ana",
      "A Hora da Estrela",
      "Clarice Lispector",
      "Ficção brasileira",
      "TRADE",
      null,
      "GOOD",
      "Edição de bolso com algumas anotações a lápis. Procuro outra obra de literatura brasileira.",
      "RESERVED",
    ),
    makeListing(
      "livro-5",
      "camila",
      "Pessoas Normais",
      "Sally Rooney",
      "Romance",
      "SALE",
      26,
      "LIKE_NEW",
      "Lido uma vez, sem marcas ou rasuras.",
    ),
    makeListing(
      "livro-6",
      "ana",
      "Dom Casmurro",
      "Machado de Assis",
      "Clássicos",
      "TRADE",
      null,
      "FAIR",
      "Exemplar com sinais naturais de uso, completo e legível.",
    ),
    makeListing(
      "livro-7",
      "bruno",
      "Duna",
      "Frank Herbert",
      "Ficção científica",
      "TRADE",
      null,
      "GOOD",
      "Livro em bom estado. Aceito propostas de fantasia e ficção científica.",
    ),
    makeListing(
      "livro-8",
      "ana",
      "O Avesso da Pele",
      "Jeferson Tenório",
      "Ficção brasileira",
      "SALE",
      29,
      "LIKE_NEW",
      "Livro conservado, sem grifos, para quem busca uma leitura marcante.",
    ),
    makeListing(
      "livro-9",
      "camila",
      "Ensaio sobre a Cegueira",
      "José Saramago",
      "Ficção",
      "TRADE",
      null,
      "GOOD",
      "Edição com leves marcas de manuseio, páginas em ótimo estado.",
      "RESERVED",
    ),
  ],
  negotiations: [
    {
      id: "negociacao-exemplo",
      type: "TRADE",
      status: "PENDING",
      listingId: "livro-4",
      buyerId: "camila",
      offeredListingId: "livro-9",
      message:
        "Oi, Ana! Que tal trocar pela minha edição de Ensaio sobre a Cegueira?",
      auditEvents: [
        {
          id: "evento-exemplo",
          action: "TRADE_PROPOSED",
          createdAt: "2026-11-12T15:30:00.000Z",
        },
      ],
    },
  ],
};
const storageKey = "melivrei-demo-v1";
let state: State = seed;
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => {
  for (const listener of listeners) listener();
};
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
function getSnapshot() {
  return state;
}
function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved) as State;
      if (
        Array.isArray(parsed.users) &&
        Array.isArray(parsed.listings) &&
        Array.isArray(parsed.negotiations)
      )
        state = parsed;
    }
  } catch {
    /* A damaged demo snapshot falls back to the seeded story. */
  }
  emit();
}
function update(change: (draft: State) => void) {
  load();
  const next = structuredClone(state);
  change(next);
  state = next;
  localStorage.setItem(storageKey, JSON.stringify(state));
  emit();
}
export function useDemoStore() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => seed);
  useEffect(load, []);
  return snapshot;
}
export function currentUser(snapshot: State) {
  return (
    snapshot.users.find((user) => user.id === snapshot.currentUserId) ?? null
  );
}
export function switchUser(id: string | null) {
  update((draft) => {
    draft.currentUserId = id;
  });
}
export function registerUser(name: string, email: string) {
  const normalized = email.trim().toLowerCase();
  if (state.users.some((user) => user.email.toLowerCase() === normalized))
    throw new Error("Este e-mail já está cadastrado.");
  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalized,
  };
  update((draft) => {
    draft.users.push(user);
    draft.currentUserId = user.id;
  });
  return user;
}
export function signIn(email: string) {
  const user = state.users.find(
    (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
  );
  if (!user) throw new Error("Não encontramos uma conta com este e-mail.");
  switchUser(user.id);
}
export type ListingInput = {
  title: string;
  author: string;
  description: string;
  condition: BookCondition;
  mode: ListingMode;
  genre: string;
  isbn: string;
  price: number | null;
  imageUrl: string;
  imageAlt: string;
};
export function saveListing(input: ListingInput, id?: string) {
  const user = currentUser(state);
  if (!user) throw new Error("Entre para anunciar um livro.");
  if (!input.title || !input.author || !input.description)
    throw new Error("Preencha título, autor e descrição.");
  if (input.mode === "SALE" && (!input.price || input.price <= 0))
    throw new Error("Informe um preço maior que zero.");
  const listingId = id ?? crypto.randomUUID();
  update((draft) => {
    const existing = draft.listings.find((item) => item.id === id);
    if (existing && existing.ownerId !== user.id)
      throw new Error("Este anúncio pertence a outra pessoa.");
    if (existing && existing.status !== "AVAILABLE")
      throw new Error("Este anúncio está em negociação.");
    const listing: Listing = {
      id: listingId,
      ownerId: user.id,
      description: input.description,
      condition: input.condition,
      mode: input.mode,
      price: input.mode === "SALE" ? input.price : null,
      status: "AVAILABLE",
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      book: {
        title: input.title,
        author: input.author,
        genre: input.genre || null,
        isbn: input.isbn || null,
      },
      images: input.imageUrl
        ? [
            {
              id: crypto.randomUUID(),
              url: input.imageUrl,
              altText: input.imageAlt || null,
            },
          ]
        : [],
      owner: { id: user.id, name: user.name },
    };
    draft.listings = existing
      ? draft.listings.map((item) => (item.id === id ? listing : item))
      : [listing, ...draft.listings];
  });
  return listingId;
}
export function removeListing(id: string) {
  const user = currentUser(state);
  update((draft) => {
    const listing = draft.listings.find((item) => item.id === id);
    if (
      !listing ||
      listing.ownerId !== user?.id ||
      listing.status !== "AVAILABLE"
    )
      throw new Error("Este anúncio não pode ser removido.");
    draft.listings = draft.listings.filter((item) => item.id !== id);
  });
}
function event(action: string): Event {
  return {
    id: crypto.randomUUID(),
    action,
    createdAt: new Date().toISOString(),
  };
}
export function startNegotiation(
  listingId: string,
  offeredListingId?: string,
  message?: string,
) {
  const user = currentUser(state);
  const listing = state.listings.find((item) => item.id === listingId);
  if (
    !user ||
    !listing ||
    listing.ownerId === user.id ||
    listing.status !== "AVAILABLE"
  )
    throw new Error("Este livro não está disponível para você.");
  if (listing.mode === "TRADE") {
    const offered = state.listings.find((item) => item.id === offeredListingId);
    if (
      !offered ||
      offered.ownerId !== user.id ||
      offered.status !== "AVAILABLE"
    )
      throw new Error("Escolha um livro seu que esteja disponível.");
  }
  const id = crypto.randomUUID();
  update((draft) => {
    const target = draft.listings.find((item) => item.id === listingId);
    if (target) target.status = "RESERVED";
    if (offeredListingId) {
      const offered = draft.listings.find(
        (item) => item.id === offeredListingId,
      );
      if (offered) offered.status = "RESERVED";
    }
    draft.negotiations.unshift({
      id,
      type: listing.mode,
      status: listing.mode === "SALE" ? "PENDING_PAYMENT" : "PENDING",
      listingId,
      buyerId: user.id,
      offeredListingId,
      message,
      paymentStatus: listing.mode === "SALE" ? "PENDING" : undefined,
      auditEvents: [
        event(listing.mode === "SALE" ? "PURCHASE_STARTED" : "TRADE_PROPOSED"),
      ],
    });
  });
  return id;
}
export function decideNegotiation(
  id: string,
  action: "accept" | "reject" | "pay" | "cancel" | "complete",
) {
  const user = currentUser(state);
  if (!user) throw new Error("Entre para acompanhar a negociação.");
  update((draft) => {
    const negotiation = draft.negotiations.find((item) => item.id === id);
    if (!negotiation) throw new Error("Negociação não encontrada.");
    const listing = draft.listings.find(
      (item) => item.id === negotiation.listingId,
    );
    const offered = draft.listings.find(
      (item) => item.id === negotiation.offeredListingId,
    );
    const seller = listing?.ownerId === user.id;
    const buyer = negotiation.buyerId === user.id;
    if (!seller && !buyer)
      throw new Error("Você não participa desta negociação.");
    if (
      action === "pay" &&
      negotiation.type === "SALE" &&
      negotiation.status === "PENDING_PAYMENT" &&
      buyer
    ) {
      negotiation.status = "APPROVED";
      negotiation.paymentStatus = "APPROVED";
      negotiation.auditEvents.push(event("PAYMENT_APPROVED_DEMO"));
    } else if (
      action === "accept" &&
      negotiation.type === "TRADE" &&
      negotiation.status === "PENDING" &&
      seller
    ) {
      negotiation.status = "APPROVED";
      negotiation.auditEvents.push(event("TRADE_ACCEPTED"));
    } else if (
      action === "reject" &&
      negotiation.type === "TRADE" &&
      negotiation.status === "PENDING" &&
      seller
    ) {
      negotiation.status = "REJECTED";
      negotiation.auditEvents.push(event("TRADE_REJECTED"));
      if (listing) listing.status = "AVAILABLE";
      if (offered) offered.status = "AVAILABLE";
    } else if (
      action === "cancel" &&
      (negotiation.status === "PENDING" ||
        negotiation.status === "PENDING_PAYMENT") &&
      buyer
    ) {
      negotiation.status = "CANCELLED";
      negotiation.auditEvents.push(event("NEGOTIATION_CANCELLED"));
      if (listing) listing.status = "AVAILABLE";
      if (offered) offered.status = "AVAILABLE";
    } else if (
      action === "complete" &&
      negotiation.status === "APPROVED" &&
      seller
    ) {
      negotiation.status = "COMPLETED";
      negotiation.auditEvents.push(event("NEGOTIATION_COMPLETED"));
      if (listing) listing.status = "COMPLETED";
      if (offered) offered.status = "COMPLETED";
    } else throw new Error("Esta ação não está disponível agora.");
  });
}
export function resetDemo() {
  state = seed;
  localStorage.removeItem(storageKey);
  emit();
}
