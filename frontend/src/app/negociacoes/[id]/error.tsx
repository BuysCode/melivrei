"use client";
export default function ErrorBoundary({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="shell state-panel page-error" role="alert">
      <h1>Não foi possível abrir a negociação.</h1>
      <p>Confira sua conexão e tente novamente.</p>
      <button className="button" type="button" onClick={reset}>
        Tentar novamente
      </button>
    </div>
  );
}
