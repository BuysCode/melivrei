# MeLivrei — demonstração do frontend

Interface do marketplace MeLivrei em Next.js 16, React e TypeScript. A prévia funciona de forma independente da API, do PostgreSQL e do Mercado Pago. Os dados fictícios e as ações são persistidos no navegador em `localStorage`.

## Rodar para o pitch

```bash
cd frontend
npm install
npm run dev -- -p 3001
```

Abra `http://localhost:3001`. Nenhum arquivo `.env.local` é necessário para a demonstração.

Na primeira visita, a prévia abre com o perfil **Ana Martins**. Para alternar entre os perfis de exemplo, use **Sair** e entre com `ana@melivrei.demo`, `bruno@melivrei.demo` ou `camila@melivrei.demo`.

## Roteiro sugerido

1. Na página inicial, abra o catálogo. Busque por título ou autor e use os filtros de modalidade, gênero, condição e preço.
2. Como Ana, abra **O Hobbit** e clique em **Iniciar compra**. No resumo, selecione **Ir para o checkout**. Revise o pedido e clique em **Pagar**. O resumo mostra a aprovação após esse passo.
3. Na **Minha conta** de Ana, abra a proposta recebida para **A Hora da Estrela** e aceite ou recuse a troca.
4. Publique um anúncio em **Anunciar**. Em **Minha conta**, edite ou remova um anúncio disponível.
5. Use **Sair** para navegar como visitante e acessar as telas de entrada e criação de conta.

## Escopo da simulação

- Catálogo, busca e filtros; detalhes dos livros; publicação, edição e remoção dos próprios anúncios.
- Perfis locais de demonstração e criação de novos perfis. A entrada por e-mail não valida senha; não há autenticação real.
- Compra, proposta de troca, aceite/recusa, cancelamento, conclusão e histórico de eventos.
- Checkout com resumo do pedido, total e confirmação local, sem cobrança ou coleta de dados de pagamento.

Os dados ficam somente neste navegador. Eles não são compartilhados entre computadores e podem ser apagados ao limpar o armazenamento do site. A integração com a API e o Better Auth está pendente no frontend. O checkout real previsto é o Mercado Pago Checkout Pro, com confirmação de pagamento pelo backend.

## Verificação

```bash
npm run lint
npm run build
```
