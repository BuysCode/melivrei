"use client";

import Link from "next/link";
import { currentUser, useDemoStore } from "@/lib/demo-store";

export function AccountNav() {
  const store = useDemoStore();
  const user = currentUser(store);
  return (
    <div className="account-nav">
      {user ? (
        <>
          <Link className="quiet-link" href="/minha-conta">
            Minha conta
          </Link>
          <button
            className="text-button"
            type="button"
            onClick={() => switchUser(null)}
          >
            Sair
          </button>
        </>
      ) : (
        <Link className="button button-small" href="/entrar">
          Entrar
        </Link>
      )}
    </div>
  );
}
