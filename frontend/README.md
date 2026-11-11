# MeLivrei — frontend

Interface web do marketplace MeLivrei, feita com Next.js 16 (App Router), React e TypeScript. O catálogo e os detalhes são renderizados no servidor a partir da API NestJS. Autenticação, publicação e negociações usam a sessão Better Auth mantida pelo backend.

## Rodar localmente

1. Configure e inicie o backend conforme `../backend/README.md` (PostgreSQL, migrações e chaves Stripe de teste).
2. Copie `.env.example` para `.env.local` e ajuste as variáveis:
   - `NEXT_PUBLIC_API_URL`: endereço da API acessível pelo navegador (padrão: `http://localhost:3000`).
   - `API_URL`: endereço da API acessível pelo servidor Next.js. Em Docker, pode ser diferente do endereço público.
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: chave pública de testes Stripe (`pk_test_…`). Nunca use a chave secreta no frontend.
3. Execute `npm install` e `npm run dev -- -p 3001`.
4. Abra `http://localhost:3001`. O backend deve ter `FRONTEND_URL=http://localhost:3001`.

## Telas

- `/`: apresentação e anúncios recentes.
- `/livros`: catálogo com busca por título/autor e filtro de venda/troca.
- `/livros/[id]`: detalhes, início de compra com Stripe Payment Element ou proposta de troca.
- `/entrar` e `/criar-conta`: autenticação Better Auth.
- `/anunciar`: publicação de livros (foto por URL pública, conforme contrato atual da API).
- `/negociacoes/[id]`: estado e histórico; proprietário pode aceitar ou recusar uma proposta de troca.

## Contratos e limites atuais

A API só permite buscar anúncios por texto e modalidade. Filtros por gênero, condição e preço, edição de anúncios, upload de fotos, listagem de negociações do usuário e retomada de um pagamento pendente após recarregar a página dependem de novos endpoints no backend. O frontend não considera um pagamento confirmado até receber o estado atualizado pela API, após o webhook Stripe.

## Verificação

`npm run lint` e `npm run build` validam formatação, lint, tipos e build de produção.
