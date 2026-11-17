# MeLivrei — demonstração do frontend

Interface do marketplace MeLivrei em Next.js 16, React e TypeScript. **Por enquanto, o frontend funciona sem backend, PostgreSQL ou Stripe.** Os dados e as ações são simulados no navegador e persistidos em `localStorage`.

## Rodar para o pitch

```bash
cd frontend
npm install
npm run dev -- -p 3001
```

Abra `http://localhost:3001`. Nenhum arquivo `.env.local` é necessário para a demonstração.

O site começa no perfil **Ana Martins**. Use o seletor de perfil no cabeçalho para alternar entre Ana, Bruno, Camila e visitante. O botão **Reiniciar demo** no cabeçalho (ou **Reiniciar dados da demonstração** em Minha conta) repõe os dados iniciais. Ele apaga os dados locais da demonstração neste navegador.

## Roteiro sugerido

1. Na página inicial, abra o catálogo. Busque por título ou autor e use os filtros de modalidade, gênero, condição e preço.
2. Como Ana, abra **A vida invisível de Addie LaRue**, inicie a compra e clique em **Simular pagamento aprovado**. Troque para Bruno e marque a venda como concluída.
3. Reinicie a demo. Na **Minha conta** de Ana, abra a proposta recebida para **A Hora da Estrela** e aceite ou recuse a troca.
4. Publique um anúncio em **Anunciar**. Em **Minha conta**, edite ou remova um anúncio disponível.
5. Se desejar, mude para **Visitante** e percorra as telas de entrada e criação de perfil local.

## Escopo da simulação

- Catálogo, busca e filtros; detalhes dos livros; publicação, edição e remoção dos próprios anúncios.
- Perfis locais de demonstração e criação de novos perfis. A entrada por e-mail não valida senha; não há autenticação real.
- Compra, proposta de troca, aceite/recusa, cancelamento, conclusão e histórico de eventos.
- Pagamento **inteiramente simulado**, sem Stripe ou cobrança. Não insira dados reais de pagamento.

Os dados ficam somente neste navegador. Eles não são compartilhados entre computadores e podem ser apagados ao limpar o armazenamento do site. A integração real com a API, Better Auth e Stripe deve ser retomada após a apresentação; os contratos antigos permanecem em `src/lib/api.ts` e `src/lib/auth-client.ts` como referência.

## Verificação

```bash
npm run lint
npm run build
```
