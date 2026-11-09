# MeLivrei API

API REST do marketplace de livros usados MeLivrei. O escopo implementado é compra/venda e troca; empréstimos não fazem parte do sistema.

## Pré-requisitos

- Node.js 24+
- PostgreSQL 16+

## Configuração

1. Copie `.env.example` para `.env` e informe valores seguros para `JWT_SECRET` e `STRIPE_WEBHOOK_SECRET`.
2. Crie o banco indicado em `DATABASE_URL`.
3. Execute os comandos abaixo:

```bash
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run start:dev
```

A API sobe em `http://localhost:3000/api` e a documentação Swagger está em `http://localhost:3000/docs`.

## Endpoints principais

| Método | Rota | Autenticação | Finalidade |
|---|---|---|---|
| POST | `/api/auth/register` | Não | Criar conta e receber JWT |
| POST | `/api/auth/login` | Não | Autenticar usuário |
| GET | `/api/listings` | Não | Consultar catálogo e filtros |
| POST | `/api/listings` | Bearer JWT | Publicar anúncio de venda ou troca |
| POST | `/api/negotiations/purchases` | Bearer JWT | Iniciar compra e pagamento sandbox |
| POST | `/api/negotiations/trades` | Bearer JWT | Propor troca entre dois anúncios |
| PATCH | `/api/negotiations/:id/accept` | Bearer JWT | Aceitar uma proposta de troca |
| PATCH | `/api/negotiations/:id/reject` | Bearer JWT | Recusar uma proposta de troca |
| GET | `/api/negotiations/:id` | Bearer JWT | Consultar estado e histórico |
| POST | `/api/payments/webhook` | Assinatura | Processar webhook de pagamento |

## Qualidade

```bash
npm test -- --runInBand
npm run lint
npm run build
```

O webhook é preparado para ambiente sandbox: a assinatura é validada antes de atualizar um pagamento ou negociação e eventos duplicados são ignorados.
