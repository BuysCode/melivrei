# Implementation Plan — Production cutover

> Status: Implementado · Atualizado em 2026-11-24

## Objetivo

Operar o MeLivrei exclusivamente com autenticação, persistência e pagamentos reais, removendo a prévia baseada em `localStorage` e os dados fictícios do frontend.

## Entregas concluídas

- O catálogo, detalhes de anúncio, criação de anúncio, conta e negociações usam a API NestJS sem flag de modo alternativo.
- O frontend usa Better Auth para cadastro, entrada e encerramento de sessão.
- Compras são iniciadas pela API e o checkout usa somente o Payment Brick do Mercado Pago para Pix e cartão.
- Propostas de troca usam os endpoints autenticados; a conta lista anúncios próprios e negociações, e o proprietário pode aceitar ou recusar uma proposta.
- A API passou a expor os anúncios do usuário autenticado e a incluir trocas no histórico de negociações.
- Componentes, dados de armazenamento local, rotas e imagens da prévia foram removidos.

## Configuração obrigatória antes da publicação

1. Criar um PostgreSQL de produção e aplicar as migrações Prisma versionadas.
2. Configurar `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `FRONTEND_URL` e as URLs públicas corretas.
3. Configurar as credenciais Mercado Pago, a chave de cifragem, a chave pública do Brick e a URL pública do webhook.
4. Registrar a URL de retorno OAuth e as URLs de resultado do pagamento no Mercado Pago.
5. Validar, com contas distintas em ambiente de teste, publicação, conexão OAuth do vendedor, Pix, cartão, confirmação do webhook e troca.

## Verificações executadas

- `frontend: npm run build`
- `frontend: npx biome check` nos arquivos alterados
- `backend: npm test -- --runInBand`
- `backend: npm run lint`
- `backend: npm run build`
