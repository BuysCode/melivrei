# MeLivrei — frontend

Interface do marketplace MeLivrei em Next.js 16, React e TypeScript. Todos os dados vêm da API NestJS, e as contas usam Better Auth com sessões persistidas por cookie.

## Desenvolvimento local

Inicie PostgreSQL e a API conforme o [README da raiz](../README.md). Depois crie `frontend/.env.local`:

```dotenv
API_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=
```

Preencha a chave pública do Mercado Pago e execute:

```bash
npm ci
npm run dev
```

O site fica disponível em http://localhost:3001.

## Pagamentos

O comprador inicia uma compra por um anúncio de venda. O checkout prepara a negociação na API e exibe o Payment Brick do Mercado Pago para Pix ou cartão. Dados completos do cartão são tratados pelo Mercado Pago; o frontend não os armazena nem os envia diretamente à aplicação. O estado da compra só é aprovado após o webhook validado pelo backend.

Antes de receber pagamentos, o vendedor conecta sua conta Mercado Pago em **Minha conta**. As variáveis de OAuth, webhook e criptografia do backend estão documentadas em [backend/.env.example](../backend/.env.example).

## Verificação

```bash
npm run lint
npm run build
```
