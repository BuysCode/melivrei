"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export function AccountNav() {
  const session = authClient.useSession();
  return (
    <div className="account-nav">
      {session.data?.user ? (
        <>
          <Link className="quiet-link" href="/minha-conta">
            Minha conta
          </Link>
          <button
            className="text-button"
            type="button"
            onClick={() => void authClient.signOut()}
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
