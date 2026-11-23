# MeLivrei API

API REST do marketplace de livros usados, construída com NestJS 12, Prisma 7 e PostgreSQL 16. Vendas usam Mercado Pago Payment Brick com pagamentos pela Payments API; trocas permanecem no módulo de negociações e não passam pelo gateway.

## Desenvolvimento local

Requisitos: Node.js 24+, PostgreSQL 16+.

```bash
cp .env.example .env
# Configure DATABASE_URL e BETTER_AUTH_SECRET. Credenciais Mercado Pago são necessárias para testar OAuth e checkout.
npm ci
npm run prisma:generate
npx prisma migrate deploy
npm run start:dev
```

Swagger: `http://localhost:3000/docs`; prefixo da API: `/api`.

O Compose na raiz ainda sincroniza schema com `prisma db push` para desenvolvimento. Ambientes persistentes devem aplicar migrações versionadas.

Em banco preexistente criado pelo `db push`, registre a migração de baseline uma vez (`npx prisma migrate resolve --applied 20261118000000_initial`) e então execute `npx prisma migrate deploy` para aplicar a migração Mercado Pago. Em banco vazio, `npx prisma migrate deploy` aplica baseline e integração em ordem.

## Pagamentos e segurança

O registro de uma compra é uma `Negotiation` do tipo `SALE`, que também funciona como referência do pedido. No checkout incorporado, o backend calcula o preço a partir do anúncio persistido, recebe do Payment Brick apenas os dados tokenizados e cria o pagamento com o access token OAuth cifrado do vendedor. O comprador pode usar Pix ou cartão de crédito. Para Pix, a API devolve QR Code e código copia e cola. Só o webhook validado e a consulta autenticada do pagamento no Mercado Pago aprovam o pedido. O fluxo legado de Checkout Pro ainda está disponível para chamadas da API sem `deferCheckout`.

O split 1:1 só funciona quando a aplicação e a conta do vendedor estão habilitadas pelo Mercado Pago. `MERCADO_PAGO_SPLIT_ENABLED` deve ser `true` apenas após configuração/homologação do marketplace. A integração bloqueia vendas se não estiver habilitado ou se o vendedor não estiver vinculado. A comissão vem de `MERCADO_PAGO_MARKETPLACE_FEE_PERCENT` (padrão zero, sem percentual comercial presumido).

Tokens OAuth são armazenados com AES-256-GCM. Gere a chave com `openssl rand -base64 32`, sem versioná-la. Webhooks usam `x-signature` HMAC-SHA256 e `x-request-id`, verificam janela temporal e consultam o pagamento remoto antes de persistir. Nunca use retorno do checkout como prova.

Para OAuth, cadastre em Sua Integração a mesma URL definida em `MERCADO_PAGO_REDIRECT_URI`. Webhooks requerem URL HTTPS acessível publicamente; para desenvolvimento local use um túnel HTTPS e configure `MERCADO_PAGO_WEBHOOK_URL` e o segredo correspondente no painel. Use somente aplicação e usuários de teste.

## Configuração

Variáveis específicas estão em `.env.example`:

- `MERCADO_PAGO_CLIENT_ID`, `MERCADO_PAGO_CLIENT_SECRET`: aplicação do integrador.
- `MERCADO_PAGO_REDIRECT_URI`: callback OAuth.
- `MERCADO_PAGO_TOKEN_ENCRYPTION_KEY`: chave AES-256-GCM em base64 (32 bytes decodificados).
- `MERCADO_PAGO_WEBHOOK_SECRET`, `MERCADO_PAGO_WEBHOOK_URL`: assinatura e URL HTTPS pública.
- `MERCADO_PAGO_ENVIRONMENT=test|production`: seleciona a URL de checkout a devolver.
- `MERCADO_PAGO_SPLIT_ENABLED=false`: bloqueio seguro até configuração do split 1:1.
- `MERCADO_PAGO_MARKETPLACE_FEE_PERCENT=0`: comissão configurável (0–100).
- `MERCADO_PAGO_SUCCESS_URL`, `MERCADO_PAGO_FAILURE_URL`, `MERCADO_PAGO_PENDING_URL`: retornos do checkout.

Não configure nem exponha tokens de vendedor manualmente. O OAuth os obtém e armazena cifrados. Para desligar conexão local, use o endpoint DELETE; a revogação remota deve ser feita também no painel Mercado Pago.

## Endpoints

Todas as rotas protegidas usam o cookie de sessão Better Auth.

| Método | Rota | Acesso | Finalidade |
|---|---|---|---|
| GET | `/api/payments/mercadopago/connect` | Usuário autenticado | Retorna `authorizationUrl` OAuth com `state` CSRF |
| GET | `/api/payments/mercadopago/callback` | Público, state obrigatório | Valida state de uso único e vincula conta |
| GET | `/api/payments/mercadopago/connection` | Usuário autenticado | Status sem tokens |
| DELETE | `/api/payments/mercadopago/connection` | Usuário autenticado | Remove vínculo local |
| POST | `/api/negotiations/purchases` | Comprador autenticado | Cria negociação de venda; com `deferCheckout: true`, aguarda o Payment Brick |
| POST | `/api/payments/negotiations/:id/checkout` | Comprador participante | Prepara valor e comprador para o Payment Brick |
| POST | `/api/payments/negotiations/:id/submit` | Comprador participante | Cria pagamento Pix ou cartão com dados tokenizados |
| GET | `/api/payments/negotiations/:id/pix` | Comprador participante | Recupera QR Code e código copia e cola do Pix pendente |
| GET | `/api/payments` | Usuário autenticado | Lista apenas pagamentos das próprias negociações |
| GET | `/api/negotiations/:id` | Participante | Consulta pagamento e estado da negociação |
| POST | `/api/payments/webhook?data.id=:id` | Público, assinatura HMAC | Consulta e processa notificação de pagamento |
| POST | `/api/negotiations/trades` | Usuário autenticado | Propõe troca sem gateway |

Exemplo de retorno de início OAuth: `{"authorizationUrl":"https://auth.mercadopago.com/authorization?..."}`. Após validar o callback, a API redireciona para o frontend configurado com `?mercado_pago=connected`. O checkout incorporado recebe o valor calculado no servidor e o status local; o retorno do pagamento Pix fornece QR Code e código copia e cola.

## Dados e limitações

Migração `20261119000000_mercado_pago_marketplace` adiciona conta OAuth do vendedor, estados OAuth consumíveis, ID da preferência, URL de checkout, comissão, metadados do provedor e estados de pagamento cancelado/contestado. A negociação existente é reaproveitada como pedido, evitando duplicar participantes e anúncios. Trocas continuam sem pagamento.

Reembolsos não são iniciados pela API nesta versão. O webhook registra estados `refunded` e `charged_back`; o reembolso 1:1 depende do saldo do vendedor e da política comercial. Falha de renovação OAuth desabilita a conta até novo vínculo. A ativação comercial do split depende da configuração e homologação da aplicação no Mercado Pago e ainda deve ser validada com credenciais de teste.

## Qualidade

```bash
npm test -- --runInBand
npm run lint
npm run build
```
