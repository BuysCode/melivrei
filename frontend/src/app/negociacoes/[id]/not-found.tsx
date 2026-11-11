import Link from "next/link";
export default function NotFound() {
  return (
    <div className="shell state-panel page-error">
      <h1>Negociação não encontrada.</h1>
      <p>Ela pode não existir ou não pertencer à sua conta.</p>
      <Link className="button" href="/livros">
        Voltar ao catálogo
      </Link>
    </div>
  );
}
