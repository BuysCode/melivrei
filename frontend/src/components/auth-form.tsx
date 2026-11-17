"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import {
  registerUser,
  signIn,
  switchUser,
  useDemoStore,
} from "@/lib/demo-store";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { users } = useDemoStore();
  const [error, setError] = useState("");
  const destination = searchParams.get("voltar");
  const next =
    destination?.startsWith("/") && !destination.startsWith("//")
      ? destination
      : "/minha-conta";
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      if (mode === "register")
        registerUser(
          String(data.get("name") ?? ""),
          String(data.get("email") ?? ""),
        );
      else signIn(String(data.get("email") ?? ""));
      router.push(next);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Não foi possível continuar.",
      );
    }
  }
  return (
    <div className="auth-layout shell">
      <div className="auth-intro">
        <h1>
          {mode === "login"
            ? "Boas leituras começam por aqui."
            : "Faça parte desta estante."}
        </h1>
        <p>
          {mode === "login"
            ? "Entre para anunciar livros e participar de compras e trocas."
            : "Crie um perfil local para testar o fluxo do MeLivrei."}
        </p>
        <div className="auth-quote">
          Cada livro encontra seu próximo leitor.
        </div>
      </div>
      <div className="form-panel">
        <h2>
          {mode === "login"
            ? "Entrar na demonstração"
            : "Criar perfil de demonstração"}
        </h2>
        <p className="demo-note">
          Esta é uma simulação local. Nenhuma senha ou dado de pagamento é
          solicitado.
        </p>
        {mode === "login" && (
          <div className="demo-profiles">
            <p>Entrar rapidamente como:</p>
            {users.slice(0, 3).map((user) => (
              <button
                key={user.id}
                type="button"
                className="profile-choice"
                onClick={() => {
                  switchUser(user.id);
                  router.push(next);
                }}
              >
                {user.name}
              </button>
            ))}
          </div>
        )}
        <form onSubmit={submit} className="form-stack">
          {mode === "register" && (
            <div className="field">
              <label htmlFor="name">Nome completo</label>
              <input
                id="name"
                name="name"
                autoComplete="name"
                required
                minLength={2}
                maxLength={100}
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button className="button button-wide" type="submit">
            {mode === "login" ? "Entrar com e-mail" : "Criar perfil"}
          </button>
        </form>
        <p className="form-switch">
          {mode === "login" ? "Ainda não tem perfil?" : "Já tem perfil?"}{" "}
          <Link
            href={`${mode === "login" ? "/criar-conta" : "/entrar"}${destination ? `?voltar=${encodeURIComponent(next)}` : ""}`}
          >
            {mode === "login" ? "Criar perfil" : "Entrar"}
          </Link>
        </p>
      </div>
    </div>
  );
}
