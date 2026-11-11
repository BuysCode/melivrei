import Link from "next/link";
export default function NotFound() {
  return (
    <div className="shell state-panel page-error">
      <h1>Livro não encontrado.</h1>
      <p>O anúncio pode ter sido removido ou o endereço está incorreto.</p>
      <Link className="button" href="/livros">
        Voltar ao catálogo
      </Link>
    </div>
  );
}
