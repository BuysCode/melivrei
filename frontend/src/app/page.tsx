import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { getListings, type Listing } from "@/lib/api";

export default async function Home() {
  let listings: Listing[] | null = null;
  try {
    listings = (await getListings()).slice(0, 4);
  } catch {
    /* The catalog presents a recovery state below. */
  }
  return (
    <>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <h1>
              Um livro que sai da sua estante pode começar outra história.
            </h1>
            <p>
              Encontre livros usados, venda os que já leu e proponha trocas
              diretamente a outros leitores.
            </p>
            <div className="hero-actions">
              <Link className="button" href="/livros">
                Explorar livros <span aria-hidden="true">→</span>
              </Link>
              <Link className="quiet-link" href="/anunciar">
                Anunciar um livro
              </Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="art-book art-book-one">
              <span>
                novas
                <br />
                leituras
              </span>
            </div>
            <div className="art-book art-book-two">
              <span>
                outras
                <br />
                histórias
              </span>
            </div>
            <div className="art-book art-book-three">
              <span>
                mais
                <br />
                caminhos
              </span>
            </div>
            <div className="art-caption">
              Uma estante. Muitas possibilidades.
            </div>
          </div>
        </div>
      </section>
      <section className="section shell" aria-labelledby="recentes">
        <div className="section-heading">
          <div>
            <h2 id="recentes">Recém-chegados</h2>
            <p>Livros que estão prontos para uma nova leitura.</p>
          </div>
          <Link className="quiet-link" href="/livros">
            Ver todo o catálogo <span aria-hidden="true">→</span>
          </Link>
        </div>
        {listings === null ? (
          <div className="state-panel">
            <h3>Não foi possível carregar os livros agora.</h3>
            <p>Confira se a API está em execução e tente novamente.</p>
            <Link className="text-link" href="/livros">
              Tentar no catálogo
            </Link>
          </div>
        ) : listings.length ? (
          <div className="listing-grid">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="state-panel">
            <h3>A estante está esperando o primeiro livro.</h3>
            <p>Quando alguém publicar um anúncio, ele aparecerá aqui.</p>
            <Link className="text-link" href="/anunciar">
              Anunciar um livro
            </Link>
          </div>
        )}
      </section>
      <section className="section section-how">
        <div className="shell how-grid">
          <div>
            <h2>Para ler mais, o livro precisa circular.</h2>
            <p>
              Você escolhe como: encontre uma edição usada, anuncie um livro ou
              ofereça uma troca.
            </p>
          </div>
          <div className="how-list">
            <div>
              <span>Encontre</span>
              <p>
                Pesquise por título ou autor e veja os detalhes de cada anúncio.
              </p>
            </div>
            <div>
              <span>Converse</span>
              <p>Inicie uma compra ou proponha um livro seu para troca.</p>
            </div>
            <div>
              <span>Combine</span>
              <p>
                A entrega do livro é acertada diretamente entre as pessoas
                envolvidas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
