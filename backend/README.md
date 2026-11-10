# MeLivrei API

API REST do marketplace de livros usados MeLivrei. O escopo implementado é compra/venda e troca; empréstimos não fazem parte do sistema.

## Pré-requisitos

- Node.js 24+
- PostgreSQL 16+

## Configuração

1. Copie `.env.example` para `.env`, gere um valor aleatório de pelo menos 32 caracteres para `BETTER_AUTH_SECRET` e informe as credenciais do Stripe.
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
| POST | `/api/auth/sign-up/email` | Não | Criar conta e sessão Better Auth |
| POST | `/api/auth/sign-in/email` | Não | Autenticar e iniciar sessão |
| POST | `/api/auth/sign-out` | Cookie de sessão | Encerrar sessão |
| GET | `/api/listings` | Não | Consultar catálogo e filtros |
| POST | `/api/listings` | Cookie de sessão | Publicar anúncio de venda ou troca |
| POST | `/api/negotiations/purchases` | Cookie de sessão | Iniciar compra e pagamento Stripe |
| POST | `/api/negotiations/trades` | Cookie de sessão | Propor troca entre dois anúncios |
| PATCH | `/api/negotiations/:id/accept` | Cookie de sessão | Aceitar uma proposta de troca |
| PATCH | `/api/negotiations/:id/reject` | Cookie de sessão | Recusar uma proposta de troca |
| GET | `/api/negotiations/:id` | Cookie de sessão | Consultar estado e histórico |
| POST | `/api/payments/webhook` | Assinatura | Processar webhook de pagamento |

## Qualidade

```bash
npm test -- --runInBand
npm run lint
npm run build
```

O webhook é preparado para ambiente sandbox: a assinatura é validada antes de atualizar um pagamento ou negociação e eventos duplicados são ignorados.

## Autenticação

A autenticação é gerenciada pelo Better Auth em `/api/auth/*`, com sessões armazenadas no PostgreSQL e enviadas ao navegador por cookie. O frontend usa `frontend/src/lib/auth-client.ts` para chamar `signUp.email`, `signIn.email`, `signOut` e `useSession`.

Em um banco já populado pela autenticação anterior, migre as senhas bcrypt da coluna `User.passwordHash` para os registros `Account` do Better Auth antes de aplicar a alteração que remove essa coluna. Em um ambiente de desenvolvimento sem usuários, execute normalmente `npm run prisma:migrate -- --name add-better-auth`.
