"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const destination = searchParams.get("voltar");
  const next =
    destination?.startsWith("/") &&
    !destination.startsWith("//") &&
    !destination.includes("\\")
      ? destination
      : "/minha-conta";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const email = String(data.get("email") ?? "");
      const password = String(data.get("password") ?? "");
      const result =
        mode === "register"
          ? await authClient.signUp.email({
              email,
              password,
              name: String(data.get("name") ?? ""),
            })
          : await authClient.signIn.email({ email, password });
      if (result.error)
        throw new Error(
          result.error.message ?? "Não foi possível acessar sua conta.",
        );
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
            : "Crie seu perfil e encontre novas histórias para a sua estante."}
        </p>
        <div className="auth-quote">
          Cada livro encontra seu próximo leitor.
        </div>
      </div>
      <div className="form-panel">
        <h2>{mode === "login" ? "Acesse sua conta" : "Criar sua conta"}</h2>
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
          <div className="field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              minLength={mode === "register" ? 8 : undefined}
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
