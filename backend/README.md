# MeLivrei API

API REST do marketplace de livros usados, construída com NestJS 12, Prisma 7 e PostgreSQL 16. Vendas e trocas usam propostas sujeitas ao aceite do anunciante. O contato pelo WhatsApp só é liberado ao interessado participante após o aceite. Conversa, pagamentos e entrega ocorrem externamente.

## Desenvolvimento local

Requisitos: Node.js 24+, PostgreSQL 16+.

```bash
cp .env.example .env
# Configure DATABASE_URL e BETTER_AUTH_SECRET.
npm ci
npm run prisma:generate
npx prisma migrate deploy
npm run start:dev
```

Swagger: `http://localhost:3000/docs`; prefixo da API: `/api`.

## Documentação de código e API

O backend usa **TSDoc**, a convenção de comentários de documentação mais próxima
do Javadoc no ecossistema TypeScript. Os comentários `/** ... */` descrevem
classes, DTOs, contratos e regras de negócio, incluindo efeitos e exceções
relevantes. Eles ficam junto ao código-fonte para facilitar manutenção e revisão.

A documentação HTTP é disponibilizada com **Swagger/OpenAPI** em `/docs`. A UI
lista rotas, filtros, DTOs e requisitos de autenticação. Para testar uma rota
protegida pelo navegador, autentique-se no mesmo host do backend: o cookie
`better-auth.session_token` será enviado pela sessão. O servidor OpenAPI já
aponta para o prefixo `/api`, portanto o **Try it out** usa as URLs corretas.

O Compose na raiz e ambientes persistentes aplicam migrações versionadas com `prisma migrate deploy`.

## Negociações e contato

`POST /api/negotiations/purchases` recebe somente `listingId`, cria proposta `SALE/PENDING` e reserva o anúncio, sem cobrança. O anunciante pode aceitar ou recusar propostas de venda e troca. O aceite exige WhatsApp cadastrado; a recusa libera os anúncios envolvidos. As decisões verificam `PENDING` dentro da transação para impedir sobrescrita ou repetição concorrente.

O número `User.whatsappNumber` é privado e atualizado apenas pela própria sessão. A API entrega o link `wa.me` somente ao interessado participante quando a negociação é `APPROVED` e existe evento de aceite registrado pelo anunciante. Aprovação financeira antiga não equivale a aceite. Listagens e detalhes não incluem o telefone; a autenticação não foi alterada para expor esse campo.

## Configuração

Use `.env.example`: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `FRONTEND_URL` e `PORT`. Não há credenciais de pagamento ou serviço de mensagens. O WhatsApp é aberto por link externo, sem envio de mensagens pela API.

## Endpoints de negociação

Todas estas rotas exigem cookie de sessão Better Auth.

| Método | Rota | Acesso | Finalidade |
|---|---|---|---|
| GET | `/api/negotiations/contact-profile` | Própria sessão | Consultar o próprio WhatsApp |
| PATCH | `/api/negotiations/contact-profile` | Própria sessão | Atualizar com `{ "whatsappNumber": "5551999999999" }` |
| POST | `/api/negotiations/purchases` | Interessado | Enviar proposta de compra com `listingId` |
| POST | `/api/negotiations/trades` | Interessado | Propor troca com `listingId`, `offeredListingId` e mensagem opcional |
| GET | `/api/negotiations/purchases` | Participante | Listar propostas de venda e troca |
| GET | `/api/negotiations/:id` | Participante | Consultar proposta, histórico e `canContact`, sem telefone |
| PATCH | `/api/negotiations/:id/accept` | Anunciante | Aceitar proposta pendente |
| PATCH | `/api/negotiations/:id/reject` | Anunciante | Recusar proposta pendente |
| GET | `/api/negotiations/:id/contact` | Interessado após aceite | Retornar `{ "url": "https://wa.me/5551999999999" }` |

O número deve conter código do país e DDD, com 8 a 15 dígitos e sem zero inicial. O formato não comprova que o número possui conta no WhatsApp. Terceiros recebem 404 para negociação e contato; participante sem aceite recebe 403; falta de número no aceite resulta em 400. Propostas já decididas são recusadas; conflito concorrente retorna 409. Rotas de pagamento, checkout, OAuth e webhook foram removidas.

## Migração e dados existentes

A migração `20261127000000_external_negotiation_contact` adiciona o telefone opcional, converte `PENDING_PAYMENT` em `PENDING` sem alterar a reserva existente e remove tabelas, enum e eventos de auditoria exclusivos de pagamento. Usuários, livros, anúncios, participantes, propostas e os demais eventos são preservados. Os demais estados históricos continuam iguais; aprovação financeira antiga não libera contato.

As migrações antigas devem permanecer no repositório para permitir upgrade de bancos já versionados e criação de bancos vazios em ordem. A nova migração elimina dados financeiros e tokens quando aplicada; faça backup antes de aplicá-la em banco persistente. Não foi executada sobre o banco local do projeto nesta alteração.

Para bancos sem histórico de migração, criados por `db push`, confira primeiro quais estruturas existem. Se o schema corresponde ao baseline inicial, registre somente `20261118000000_initial` como aplicado. Se também contém integralmente as estruturas da segunda migração, registre também `20261119000000_mercado_pago_marketplace` como aplicada. Use `npx prisma migrate resolve --applied <nome>` somente após essa conferência e execute `npx prisma migrate deploy`. Não marque como aplicada uma migração cujas alterações estejam ausentes. Bancos vazios não precisam de baseline manual.

## Qualidade

```bash
npm test -- --runInBand
npm run lint
npm run build
```
