"use client";

import Link from "next/link";
import { currentUser, switchUser, useDemoStore } from "@/lib/demo-store";

import { liveCheckout } from "@/lib/api";
import { authClient } from "@/lib/auth-client";

function LiveAccountNav() {
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

export function AccountNav() {
  return liveCheckout ? <LiveAccountNav /> : <DemoAccountNav />;
}

function DemoAccountNav() {
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
