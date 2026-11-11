import Image from "next/image";
import Link from "next/link";
import { AccountNav } from "./account-nav";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link
          href="/"
          aria-label="MeLivrei, página inicial"
          className="brand-link"
        >
          <Image
            src="/brand/logo.svg"
            alt=""
            width={164}
            height={42}
            priority
          />
        </Link>
        <nav className="main-nav" aria-label="Navegação principal">
          <Link href="/livros">Explorar livros</Link>
          <Link href="/anunciar">Anunciar</Link>
        </nav>
        <AccountNav />
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <Image src="/brand/logo.svg" alt="MeLivrei" width={135} height={35} />
          <p>Livros usados, novas leituras.</p>
        </div>
        <nav aria-label="Navegação do rodapé">
          <Link href="/livros">Explorar livros</Link>
          <Link href="/anunciar">Anunciar um livro</Link>
        </nav>
        <span>© {new Date().getFullYear()} MeLivrei</span>
      </div>
    </footer>
  );
}
