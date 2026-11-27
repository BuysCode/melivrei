# MeLivrei — frontend

Interface do marketplace MeLivrei em Next.js 16, React e TypeScript. Todos os dados vêm da API NestJS, e as contas usam Better Auth com sessões persistidas por cookie.

## Desenvolvimento local

Inicie PostgreSQL e a API conforme o [README da raiz](../README.md). Depois crie `frontend/.env.local`:

```dotenv
API_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Execute:

```bash
npm ci
npm run dev
```

O site fica disponível em http://localhost:3001.

## Propostas e contato externo

O interessado envia uma proposta de compra ou troca. Em Minha conta, o anunciante cadastra seu WhatsApp com código do país e DDD e acompanha as propostas recebidas. Na tela da negociação, pode aceitar ou recusar.

Somente após o aceite, a tela do interessado apresenta **Entrar em contato**, com link para o WhatsApp do anunciante. A API valida participação e aceite antes de retornar o contato. A recusa libera o anúncio e não disponibiliza contato. Conversa, pagamento e entrega são combinados externamente; o aceite não representa confirmação financeira.

Checkout, resultados de pagamento e conexão de conta financeira foram removidos. A interface mantém as páginas e o estilo existentes nos demais fluxos.

## Verificação

```bash
npm run lint
npm run build
```
