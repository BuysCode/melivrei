"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const destination = searchParams.get("voltar");
  const next =
    destination?.startsWith("/") && !destination.startsWith("//")
      ? destination
      : "/livros";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    try {
      const result =
        mode === "register"
          ? await authClient.signUp.email({
              name: String(data.get("name") ?? ""),
              email,
              password,
            })
          : await authClient.signIn.email({ email, password });
      if (result.error) {
        setError(
          mode === "login"
            ? "E-mail ou senha inválidos. Confira os dados e tente novamente."
            : result.error.message || "Não foi possível criar sua conta.",
        );
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError(
        "Não foi possível conectar à API. Tente novamente em instantes.",
      );
    } finally {
      setPending(false);
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
            : "Crie sua conta para dar um novo destino aos seus livros."}
        </p>
        <div className="auth-quote">
          Cada livro encontra seu próximo leitor.
        </div>
      </div>
      <div className="form-panel">
        <h2>{mode === "login" ? "Entrar na conta" : "Criar conta"}</h2>
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
                mode === "login" ? "current-password" : "new-password"
              }
              required
              minLength={8}
              aria-describedby={
                mode === "register" ? "password-help" : undefined
              }
            />
            {mode === "register" && (
              <small id="password-help">Use pelo menos 8 caracteres.</small>
            )}
          </div>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="button button-wide"
            type="submit"
            disabled={pending}
          >
            {pending ? "Aguarde…" : mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>
        <p className="form-switch">
          {mode === "login" ? "Ainda não tem conta?" : "Já tem conta?"}{" "}
          <Link
            href={`${mode === "login" ? "/criar-conta" : "/entrar"}${destination ? `?voltar=${encodeURIComponent(next)}` : ""}`}
          >
            {mode === "login" ? "Criar conta" : "Entrar"}
          </Link>
        </p>
      </div>
    </div>
  );
}
