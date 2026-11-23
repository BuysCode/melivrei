# MeLivrei — demonstração do frontend

Interface do marketplace MeLivrei em Next.js 16, React e TypeScript. A prévia funciona de forma independente da API, do PostgreSQL e do Mercado Pago. Os dados fictícios e as ações são persistidos no navegador em `localStorage`.

## Rodar para o pitch

```bash
cd frontend
npm install
npm run dev -- -p 3001
```

Abra `http://localhost:3001`. Nenhum arquivo `.env.local`, API, banco de dados ou chave do Mercado Pago é necessário para a demonstração local.

No modo local, a interface exibe a identificação **Prévia local · dados fictícios**. A primeira visita abre com o perfil **Ana Martins** e os dados iniciais da demonstração. A seção **Minha conta** inclui **Reiniciar demonstração**; confirme a ação para apagar alterações locais, restaurar os dados iniciais e voltar ao início.

Para gravar, use uma janela de navegador em proporção 16:9, tela cheia e zoom de 100%, sem ferramentas de desenvolvimento abertas. Reinicie a demonstração antes de começar.

## Roteiro sugerido

1. Na página inicial, abra o catálogo. Busque por título ou autor e mostre os filtros de modalidade, gênero, condição e preço.
2. Abra **O Hobbit**, inicie a compra e selecione **Ir para o checkout**. Escolha cartão e use **Confirmar pagamento** para concluir o pedido.
3. Em **Minha conta**, mostre o histórico da compra e abra a proposta recebida para **A Hora da Estrela**. Aceite a troca para demonstrar a atualização do estado.

O roteiro demonstra a navegação no catálogo, a compra simulada e o fluxo de troca. Páginas legais, cadastro, edição de anúncios e configurações de pagamento ficam fora desta gravação.

## Escopo da simulação

- Catálogo, busca e filtros; detalhes dos livros; publicação, edição e remoção dos próprios anúncios.
- Perfis locais de demonstração e criação de novos perfis. A entrada por e-mail não valida senha; não há autenticação real.
- Compra, proposta de troca, aceite/recusa, cancelamento, conclusão e histórico de eventos.
- Checkout local com resumo do pedido e escolha entre Pix e cartão de crédito. A aprovação e o Pix pendente são estados simulados; o checkout local não solicita CPF ou dados de cartão, não faz cobranças e não gera QR Code nem código Pix copia e cola.

O rótulo **Prévia local · dados fictícios** e o aviso no checkout deixam explícito que a gravação mostra um protótipo sem pagamento real. O fluxo integrado ao Mercado Pago é separado e exige as configurações descritas abaixo.

Os dados ficam somente neste navegador. Eles não são compartilhados entre computadores e podem ser apagados ao limpar o armazenamento do site. A prévia local é o modo padrão. O modo com checkout real usa a API, Better Auth e o Payment Brick do Mercado Pago.

## Checkout com Mercado Pago

Configure o [backend](../backend/README.md) para Checkout Pro e preencha o `frontend/.env.local` com:

```dotenv
API_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_LIVE_CHECKOUT=true
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=
```

Preencha `NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY` com a chave pública da aplicação do marketplace. No Docker Compose, defina as duas variáveis `NEXT_PUBLIC_*` do checkout no `.env` da raiz e reconstrua o frontend. Configure as URLs de retorno para `/pagamento/sucesso`, `/pagamento/falha` e `/pagamento/pendente` no endereço do frontend.

1. Entre com a conta do vendedor, conecte o Mercado Pago em **Minha conta** e publique um livro para venda.
2. Entre com outra conta, inicie uma compra e abra o checkout no resumo do pedido.
3. O **Payment Brick** mostra cartão de crédito e Pix no MeLivrei. O backend cria o pagamento com a comissão do marketplace e a conta OAuth do vendedor. Para Pix, o QR Code e o código copia e cola do Mercado Pago aparecem no próprio checkout.
4. O resumo consulta o estado persistido da compra. Se o webhook ainda estiver sendo processado, use **Atualizar status**.

Esse modo integra a publicação, o catálogo e as compras e vendas. A confirmação da compra depende do webhook validado do Mercado Pago. O fluxo de trocas na interface continua disponível na prévia local.

## Verificação

```bash
npm run lint
npm run build
```
