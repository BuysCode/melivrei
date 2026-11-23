# MeLivrei

Marketplace web de livros usados para compra, venda e troca entre usuários. A plataforma permite publicar anúncios, encontrar livros e acompanhar negociações; vendas são confirmadas por webhook validado do Mercado Pago, sem armazenamento de dados de cartão.

> **Estado atual:** o frontend oferece uma prévia com dados fictícios e um modo conectado à API. No modo conectado, o Payment Brick permite pagar com Pix ou cartão de crédito dentro do MeLivrei; o backend confirma a compra por webhook do Mercado Pago.

## Stack

| Camada | Tecnologias | Responsabilidade |
| --- | --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, CSS | Interface, catálogo, anúncios e fluxos demonstrativos. |
| Backend | NestJS 12, TypeScript, class-validator | API REST, regras de negócio, autorização e documentação Swagger. |
| Autenticação | Better Auth, bcrypt | Contas, sessões persistidas em cookie e proteção de rotas. |
| Dados | PostgreSQL 16, Prisma 7 | Persistência relacional de usuários, livros, anúncios e negociações. |
| Pagamentos | Mercado Pago Payment Brick e Payments API | Pix e cartão de crédito na plataforma, OAuth de vendedores, split 1:1 configurável e confirmação por webhook assinado. |
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
│   │   ├── negotiations/    # Compras, trocas e estados
│   │   └── payments/        # Mercado Pago, OAuth e processamento de webhook
│   └── test/                # Configuração de testes
├── frontend/                # Aplicação Next.js
│   ├── src/app/             # Rotas e telas
│   ├── src/components/      # Componentes de interface
│   ├── src/lib/             # Cliente API, auth e dados da demo
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

O frontend pode ser executado sem backend, banco de dados ou chaves do Mercado Pago, pois usa a demonstração local.

```bash
cd frontend
npm ci
npm run dev -- -p 3001
```

Abra http://localhost:3001. Na primeira visita, a prévia abre com o perfil **Ana Martins**. O [roteiro do frontend](frontend/README.md#roteiro-sugerido) mostra como navegar pelos fluxos de compra e troca.

### Opção 3 — Backend local

Pré-requisitos: Node.js 24+, PostgreSQL 16+ e uma instância de banco criada.

```bash
cd backend
cp .env.example .env
# Ajuste DATABASE_URL, BETTER_AUTH_SECRET e as chaves de teste do Mercado Pago no .env
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
| [PRD-01](docs/prd/PRD-01.md) | Define visão do produto, público, regras de negócio, requisitos funcionais e não funcionais, histórias de usuário, critérios de aceite e rastreabilidade. |
| [ADR-001](docs/adr/ADR-001-ARQUITETURA-E-STACK.md) | Registra e justifica a arquitetura separada de frontend, API e banco, além da escolha de Next.js, NestJS, PostgreSQL, Prisma, Mercado Pago e Docker Compose. |
| [Registro de uso de IA](docs/AI_USAGE.md) | Lista os usos da IA como apoio à documentação, implementação, identidade visual, demonstração e infraestrutura do projeto. |
| [Identidade visual](identidade-visual/README.md) | Reúne estudos, versões aprovadas do logotipo, ícones, exports e guia de aplicação da marca MeLivrei. |

### Diagramas de arquitetura

| Arquivo | Resumo |
| --- | --- |
| [C4 — Contexto](docs/arquitetura/c4-contexto.puml) | Apresenta o MeLivrei como marketplace entre visitantes, usuários autenticados e Mercado Pago, delimitando que a entrega física ocorre fora da plataforma. |
| [C4 — Containers](docs/arquitetura/c4-containers.puml) | Mostra a comunicação entre navegador, frontend Next.js, API NestJS, PostgreSQL via Prisma e Mercado Pago, além dos módulos internos da API. |

### Diagramas UML

| Arquivo | Resumo |
| --- | --- |
| [Casos de uso](docs/uml/casos-de-uso.md) | Mostra os atores visitante, usuário, anunciante, interessado e Mercado Pago nos fluxos de conta, catálogo, anúncios, compra, troca, pagamento, negociação e histórico. |
| [Especificação de casos de uso](docs/uml/especificacao-casos-de-uso.md) | Detalha pré-condições, fluxos principais, alternativas e pós-condições para gerenciar anúncio, comprar livro e propor troca. |
| [Diagrama de classes](docs/uml/diagrama-de-classes.puml) | Modela as entidades do domínio — usuário, livro, anúncio, negociação, proposta de troca, pagamento e auditoria — com suas relações e estados. |
| [Sequência de compra com Mercado Pago](docs/uml/sequencia-compra-mercado-pago.puml) | Descreve o vínculo OAuth, reserva do anúncio, pagamento com Pix ou cartão e confirmação por webhook validado. |

## Fluxos principais

- **Venda:** o vendedor vincula a conta via OAuth, o interessado inicia a compra, o anúncio é reservado e o pagamento é confirmado pela consulta autenticada feita a partir de webhook validado. O split depende da configuração do marketplace.
- **Troca:** o interessado oferece um anúncio próprio; o proprietário aceita ou recusa, e os dois anúncios são atualizados conforme o resultado.
- **Demonstração:** a interface reproduz os fluxos localmente. A compra passa pelo resumo e por uma página de checkout antes da aprovação simulada.

## Variáveis de ambiente

Para Docker, use a raiz do projeto como referência: [.env.example](.env.example). Para execução local da API, use [backend/.env.example](backend/.env.example). Nunca versione arquivos `.env` nem chaves reais do Mercado Pago.

## Limitações atuais

- O frontend de demonstração utiliza `localStorage`; login, pagamento e dados não são reais nesse modo.
- O [modo de checkout real](frontend/README.md#checkout-com-mercado-pago) consome a API para compras e vendas. A interface de trocas continua disponível na prévia local.
- O Docker sincroniza o schema com `prisma db push` no ambiente local; ambientes persistentes devem aplicar as migrações Prisma versionadas.
