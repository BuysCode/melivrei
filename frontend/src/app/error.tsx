"use client";

export default function ErrorBoundary({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="shell state-panel page-error" role="alert">
      <h1>Não foi possível carregar esta página.</h1>
      <p>Tente novamente em instantes.</p>
      <button className="button" type="button" onClick={reset}>
        Tentar novamente
      </button>
    </div>
  );
}
