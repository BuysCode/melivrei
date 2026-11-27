# Diagrama de casos de uso — MeLivrei

```mermaid
flowchart LR
    visitante[Visitante]
    usuario((Usuário))
    anunciante((Anunciante))
    interessado((Interessado))

    subgraph sistema["MeLivrei — Marketplace"]
        UC01((Criar conta))
        UC02((Autenticar usuário))
        UC03((Gerenciar anúncio))
        UC04((Consultar catálogo))
        UC05((Pesquisar livros))
        UC06((Propor compra))
        UC07((Propor troca))
        UC09((Acompanhar negociação))
        UC10((Consultar histórico))
        UC11((Aceitar ou recusar proposta))
        UC12((Cadastrar WhatsApp))
        UC13((Entrar em contato após aceite))
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

    anunciante --> UC11
    anunciante --> UC12
    interessado --> UC13

    classDef actor fill:#e8f0fe,stroke:#356ae6,color:#172554,stroke-width:1px;
    class visitante,usuario,anunciante,interessado actor;
```

## Observações

- O diagrama representa o escopo de venda e troca definido no PRD.
- Os papéis `Anunciante` e `Interessado` representam funções que um mesmo usuário pode exercer em diferentes negociações.

- UC-08 foi retirado do escopo. O aceite em UC-11 libera UC-13 somente ao interessado participante; conversa e pagamentos ocorrem externamente.
