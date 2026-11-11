"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function AccountNav() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  async function leave() {
    await authClient.signOut();
    router.refresh();
    router.push("/");
  }
  return (
    <div className="account-nav">
      {isPending ? (
        <output className="session-loading">
          <span className="sr-only">Verificando sessão</span>
        </output>
      ) : session?.user ? (
        <>
          <span className="account-name">
            Olá, {session.user.name?.split(" ")[0]}
          </span>
          <button className="text-button" type="button" onClick={leave}>
            Sair
          </button>
        </>
      ) : (
        <>
          <Link className="text-button" href="/entrar">
            Entrar
          </Link>
          <Link className="button button-small" href="/criar-conta">
            Criar conta
          </Link>
        </>
      )}
    </div>
  );
}
