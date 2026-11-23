import Link from "next/link";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

export type LegalDocumentContent = {
  title: string;
  intro: string;
  updatedAt: string;
  sections: LegalSection[];
};

export function LegalDocument({
  document,
}: {
  document: LegalDocumentContent;
}) {
  return (
    <article className="legal-page shell">
      <header className="legal-heading">
        <p className="eyebrow">MeLivrei · informações legais</p>
        <h1>{document.title}</h1>
        <p className="legal-intro">{document.intro}</p>
        <p className="legal-updated">Versão de {document.updatedAt}</p>
      </header>
      <div className="legal-content">
        {document.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {section.items && (
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
      <nav className="legal-related" aria-label="Outros documentos legais">
        <Link href="/termos-de-uso">Termos de Uso</Link>
        <Link href="/politica-de-privacidade">Política de Privacidade</Link>
        <Link href="/termos-de-servico">Termos de serviço</Link>
        <Link href="/politica-de-reembolso">Política de reembolso</Link>
        <Link href="/trocas-e-devolucoes">Trocas e devoluções</Link>
      </nav>
    </article>
  );
}
