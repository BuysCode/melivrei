"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  currentUser,
  resetDemo,
  switchUser,
  useDemoStore,
} from "@/lib/demo-store";

export function AccountNav() {
  const store = useDemoStore();
  const user = currentUser(store);
  const router = useRouter();
  return (
    <div className="account-nav">
      <select
        className="demo-switch"
        aria-label="Perfil de demonstração"
        value={user?.id ?? ""}
        onChange={(event) => {
          switchUser(event.target.value || null);
          router.refresh();
        }}
      >
        <option value="">Visitante</option>
        {store.users.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
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
      <button
        className="demo-reset"
        type="button"
        title="Restaurar os dados de exemplo"
        onClick={() => {
          resetDemo();
          router.push("/");
        }}
      >
        Reiniciar demo
      </button>
    </div>
  );
}
