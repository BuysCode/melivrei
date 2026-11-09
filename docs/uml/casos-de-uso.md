# Diagrama de casos de uso — MeLivrei

```mermaid
flowchart LR
    visitante[Visitante]
    usuario((Usuário))
    anunciante((Anunciante))
    interessado((Interessado))
    stripe[Stripe]

    subgraph sistema["MeLivrei — Marketplace"]
        UC01((Criar conta))
        UC02((Autenticar usuário))
        UC03((Gerenciar anúncio))
        UC04((Consultar catálogo))
        UC05((Pesquisar livros))
        UC06((Comprar livro))
        UC07((Propor troca))
        UC08((Confirmar pagamento))
        UC09((Acompanhar negociação))
        UC10((Consultar histórico))
    end

    visitante --> UC01
    visitante --> UC04
    visitante --> UC05
    usuario --> UC02
    usuario --> UC04
    usuario --> UC05
    usuario --> UC06
    usuario --> UC07
    usuario --> UC09
    usuario --> UC10
    anunciante --> UC03
    anunciante --> UC06
    anunciante --> UC07
    interessado --> UC06
    interessado --> UC07
    interessado --> UC09
    UC06 -.->|inclui| UC08
    stripe --> UC08

    classDef actor fill:#e8f0fe,stroke:#356ae6,color:#172554,stroke-width:1px;
    classDef external fill:#fff7ed,stroke:#c2410c,color:#431407,stroke-width:1px;
    class visitante,usuario,anunciante,interessado actor;
    class stripe external;
```

## Observações

- O diagrama representa o escopo de venda e troca definido no PRD.
- `inclui` representa um comportamento necessário dentro do fluxo principal.
- Os papéis `Anunciante` e `Interessado` representam funções que um mesmo usuário pode exercer em diferentes negociações.
- O Stripe é o sistema externo responsável pela confirmação de pagamentos; os dados completos do cartão não pertencem ao sistema.
