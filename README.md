# MeLivrei

Marketplace web de livros usados para compra, venda e troca entre usuários. A plataforma permite publicar anúncios, encontrar livros e acompanhar negociações; o anunciante aceita ou recusa propostas, e o contato pelo WhatsApp é liberado ao interessado somente após o aceite. Conversa, pagamento e entrega são combinados externamente.

> **Estado atual:** o frontend consome a API e autentica com Better Auth. Vendas e trocas usam propostas, decisão do anunciante e contato externo condicionado ao aceite.

## Stack

| Camada | Tecnologias | Responsabilidade |
| --- | --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, CSS | Interface, catálogo, anúncios e fluxos de compra e troca. |
| Backend | NestJS 12, TypeScript, class-validator | API REST, regras de negócio, autorização e documentação Swagger. |
| Autenticação | Better Auth, bcrypt | Contas, sessões persistidas em cookie e proteção de rotas. |
| Dados | PostgreSQL 16, Prisma 7 | Persistência relacional de usuários, livros, anúncios e negociações. |
| Qualidade | Jest, Oxlint, Biome | Testes, lint e validação de qualidade. |
| Infraestrutura | Docker e Docker Compose | Execução reproduzível de banco, API e frontend. |

## Estrutura de pastas

```text
.
├── backend/                 # API NestJS e schema Prisma
│   ├── prisma/              # Modelos do banco de dados
│   ├── src/
│   │   ├── auth/            # Better Auth, guardas e usuário atual
│   │   ├── database/        # Prisma e conexão PostgreSQL
│   │   ├── listings/        # Catálogo e anúncios
│   │   └── negotiations/    # Compras, trocas e estados
│   └── test/                # Configuração de testes
├── frontend/                # Aplicação Next.js
│   ├── src/app/             # Rotas e telas
│   ├── src/components/      # Componentes de interface
│   ├── src/lib/             # Cliente API e autenticação
│   └── public/brand/        # Logotipo e símbolo usados no site
├── docs/                    # Requisitos, arquitetura, UML e registro de IA
│   ├── adr/                 # Registros de decisão arquitetural
│   ├── arquitetura/         # Diagramas C4
│   ├── prd/                 # Documento de requisitos do produto
│   └── uml/                 # Diagramas e especificações de casos de uso
├── identidade-visual/       # Estudos, arquivos finais e guia da marca
├── compose.yaml             # Ambiente Docker padrão
├── compose.dev.yaml         # Sobreposição Docker para desenvolvimento
└── .env.example             # Variáveis do ambiente Docker
```

## Como executar

### Opção 1 — Ambiente completo com Docker

Pré-requisito: Docker Engine com Docker Compose.

```bash
cp .env.example .env
docker compose up --build
```

| Serviço | Endereço |
| --- | --- |
| Frontend | http://localhost:3001 |
| API | http://localhost:3000/api |
| Swagger | http://localhost:3000/docs |
| PostgreSQL | `localhost:5432` |

Para desenvolver com recarregamento automático dos códigos:

```bash
docker compose -f compose.yaml -f compose.dev.yaml up --build
```

Para encerrar os serviços, preservando os dados locais:

```bash
docker compose down
```

Para excluir também o volume do banco de dados local:

```bash
docker compose down --volumes
```

### Opção 2 — Frontend local

O frontend depende da API e do banco de dados.

```bash
cd frontend
npm ci
npm run dev
```

Configure `frontend/.env.local` com `API_URL` e `NEXT_PUBLIC_API_URL`; em seguida, abra http://localhost:3001.

### Opção 3 — Backend local

Pré-requisitos: Node.js 24+, PostgreSQL 16+ e uma instância de banco criada.

```bash
cd backend
cp .env.example .env
# Ajuste DATABASE_URL e BETTER_AUTH_SECRET no .env
npm ci
npm run prisma:generate
npx prisma migrate deploy
npm run start:dev
```

A API fica disponível em http://localhost:3000/api e a documentação Swagger em http://localhost:3000/docs.

## Comandos de qualidade

```bash
# backend
cd backend
npm test -- --runInBand
npm run lint
npm run build

# frontend
cd ../frontend
npm run lint
npm run build
```

## Documentação

| Documento | Resumo |
| --- | --- |
| [PRD vigente](docs/prd/negociacao-externa/prd.md) | Define visão do produto, público, regras de negócio, requisitos funcionais e não funcionais, histórias de usuário, critérios de aceite e rastreabilidade. |
| [ADR-001](docs/adr/ADR-001-ARQUITETURA-E-STACK.md) | Registra e justifica a arquitetura separada de frontend, API e banco, além da escolha de Next.js, NestJS, PostgreSQL, Prisma e Docker Compose. A parte financeira foi substituída pela ADR-002. |
| [ADR-002](docs/adr/negociacao-externa/adr.md) | Registra a redução do escopo financeiro e o contato externo condicionado ao aceite. |
| [Implementation Plan](docs/ip/negociacao-externa/ip.md) | Detalha implementação, migração, contratos, validações e implantação da redução de escopo. |
| [Registro de uso de IA](docs/AI_USAGE.md) | Lista os usos da IA como apoio à documentação, implementação, identidade visual, demonstração e infraestrutura do projeto. |
| [Identidade visual](identidade-visual/README.md) | Reúne estudos, versões aprovadas do logotipo, ícones, exports e guia de aplicação da marca MeLivrei. |

### Diagramas de arquitetura

| Arquivo | Resumo |
| --- | --- |
| [C4 — Contexto](docs/arquitetura/c4-contexto.puml) | Apresenta o MeLivrei como marketplace entre visitantes e usuários autenticados, com contato externo pelo WhatsApp, delimitando que a entrega física ocorre fora da plataforma. |
| [C4 — Containers](docs/arquitetura/c4-containers.puml) | Mostra a comunicação entre navegador, frontend Next.js, API NestJS, PostgreSQL via Prisma e o link externo para WhatsApp, além dos módulos internos da API. |

### Diagramas UML

| Arquivo | Resumo |
| --- | --- |
| [Casos de uso](docs/uml/casos-de-uso.md) | Mostra os atores visitante, usuário, anunciante, interessado nos fluxos de conta, catálogo, anúncios, propostas, aceite, contato e histórico. |
| [Especificação de casos de uso](docs/uml/especificacao-casos-de-uso.md) | Detalha pré-condições, fluxos principais, alternativas e pós-condições para gerenciar anúncio, comprar livro e propor troca. |
| [Diagrama de classes](docs/uml/diagrama-de-classes.puml) | Modela as entidades do domínio — usuário, livro, anúncio, negociação, proposta de troca e auditoria — com suas relações e estados. |

## Fluxos principais

- **Venda:** o interessado envia proposta de compra e o anúncio fica reservado. O vendedor aceita ou recusa; a recusa libera o anúncio e o aceite libera o WhatsApp do anunciante ao interessado.
- **Troca:** o interessado oferece um anúncio próprio; o proprietário aceita ou recusa, e os dois anúncios são atualizados conforme o resultado. O contato também exige aceite.
- **Contato:** o anunciante cadastra o WhatsApp em Minha conta antes de aceitar. A API só entrega o link ao interessado participante após conferir o aceite; conversa, pagamento e entrega acontecem externamente.

## Variáveis de ambiente

Para Docker, use a raiz do projeto como referência: [.env.example](.env.example). Para execução local da API, use [backend/.env.example](backend/.env.example). Nunca versione arquivos `.env` nem segredos reais.

## Limitações atuais

- O aceite de uma proposta não comprova pagamento nem entrega. A plataforma não acompanha transações financeiras externas.
- O Docker aplica migrações versionadas com `prisma migrate deploy`. Bancos preexistentes criados por `db push` precisam de baseline conforme [backend/README.md](backend/README.md).
- A nova migração remove dados e tokens financeiros. Migrações e documentos históricos são preservados para rastreabilidade.
