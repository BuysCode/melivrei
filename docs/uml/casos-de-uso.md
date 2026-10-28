```mermaid
flowchart LR
    visitante[Visitante]
    usuario((Usuário))
    anunciante((Anunciante))
    interessado((Interessado))
    proprietario((Proprietário))
    administrador((Administrador))
    stripe[Stripe]

    subgraph sistema["MeLivrei — Marketplace"]
        UC01((Criar conta))
        UC02((Autenticar usuário))
        UC03((Gerenciar anúncio))
        UC04((Consultar catálogo))
        UC05((Pesquisar livros))
        UC06((Comprar livro))
        UC07((Propor troca))
        UC08((Solicitar empréstimo))
        UC09((Confirmar pagamento))
        UC10((Acompanhar negociação))
        UC11((Registrar entrega e devolução))
        UC12((Avaliar danos))
        UC13((Calcular atraso))
        UC14((Liquidar caução))
        UC15((Contestar cobrança))
        UC16((Analisar conflito))
        UC17((Consultar histórico))
    end

    visitante --> UC01
    visitante --> UC04
    visitante --> UC05

    usuario --> UC02
    usuario --> UC04
    usuario --> UC05
    usuario --> UC06
    usuario --> UC07
    usuario --> UC08
    usuario --> UC10
    usuario --> UC15
    usuario --> UC17

    anunciante --> UC03
    anunciante --> UC06
    anunciante --> UC07
    anunciante --> UC08

    interessado --> UC06
    interessado --> UC07
    interessado --> UC08
    interessado --> UC10

    proprietario --> UC11
    proprietario --> UC12
    proprietario --> UC15

    administrador --> UC16
    administrador --> UC17

    UC06 -.->|inclui| UC09
    UC08 -.->|inclui| UC09
    UC11 -.->|inclui| UC13
    UC11 -.->|inclui| UC14
    UC12 -.->|inclui| UC14
    UC15 -.->|pode encaminhar| UC16
    stripe --> UC09

    classDef actor fill:#e8f0fe,stroke:#356ae6,color:#172554,stroke-width:1px;
    classDef external fill:#fff7ed,stroke:#c2410c,color:#431407,stroke-width:1px;
    class visitante,usuario,anunciante,interessado,proprietario,administrador actor;
    class stripe external;
```

## Observações

- O diagrama representa o escopo funcional definido no PRD.
- `inclui` representa um comportamento necessário dentro do fluxo principal.
- `pode encaminhar` representa um caminho alternativo: uma contestação pode ser encaminhada para análise administrativa.
- Os papéis `Anunciante`, `Interessado` e `Proprietário` representam funções que um mesmo usuário pode exercer em diferentes negociações.
- O Stripe é um sistema externo responsável pela confirmação de pagamentos; os dados completos do cartão não pertencem ao sistema.

