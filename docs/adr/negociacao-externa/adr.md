# ADR-002 — Negociação por proposta e contato externo

- **Status:** Aceito
- **Data:** 2026-11-27
- **Origem:** reestruturação de escopo discutida pelo grupo e solicitada nesta alteração.
- **Substitui:** somente a decisão de integração financeira da ADR-001.
- **Requisitos:** RF-007, RF-008, RF-013 a RF-015, RNF-013 e RNF-014 do [PRD vigente](../../prd/negociacao-externa/prd.md).

## Contexto

A integração com Mercado Pago, incluindo OAuth de vendedores, checkout, webhooks, split e persistência financeira, excede a complexidade adequada ao projeto acadêmico. O grupo decidiu concentrar o sistema em anúncios, propostas de compra ou troca e aproximação entre participantes.

## Decisão

Remover o módulo de pagamentos, SDK, checkout, callbacks, configuração e modelos financeiros ativos. Venda e troca passam pelo aceite ou recusa do anunciante; qualquer conversa, pagamento ou entrega ocorre externamente. O site oferece um link `wa.me` para o WhatsApp do anunciante, sem integração com uma API de mensagens.

Armazenar `User.whatsappNumber` como campo privado e opcional para compatibilidade com contas existentes. O aceite exige cadastro do número. Somente o interessado participante de negociação `APPROVED`, com um evento de aceite registrado pelo anunciante, pode obter o link. A API verifica essas condições; o catálogo e os detalhes da negociação não incluem o telefone. A conta autenticada pode consultar e atualizar apenas o próprio contato.

Preservar reservas e o fluxo de troca: propostas de venda ficam `RESERVED`; os dois anúncios de troca ficam `IN_NEGOTIATION`. A recusa libera os anúncios. Reservas e decisões são transacionais e decisões já respondidas não podem ser sobrescritas.

Criar uma migração incremental que converte `PENDING_PAYMENT` em `PENDING`, remove o estado financeiro e elimina somente tabelas, tipo e auditoria específica da integração financeira. Usuários, anúncios, propostas, participantes e demais eventos são preservados. Vendas aprovadas anteriormente mantêm seu estado histórico, mas aprovação por webhook não concede acesso ao contato.

## Alternativas consideradas

- Manter o gateway em sandbox: conserva a complexidade que motivou a redução.
- Simular pagamentos internamente: mantém estados financeiros e cria uma confirmação que não corresponde a uma transação real.
- Mostrar o telefone no anúncio: não atende à liberação condicionada ao aceite.
- Escolha adotada: registrar propostas e decisões e liberar contato externo após autorização do anunciante.

## Consequências

- Desaparecem credenciais de gateway, tokens de vendedor, checkout, processamento de webhook e confirmação financeira.
- O aceite significa autorização para negociar; não certifica pagamento, entrega ou conclusão.
- O anunciante precisa manter o próprio número correto; a aplicação valida formato, sem verificar se a conta existe no WhatsApp.
- Dados financeiros e tokens serão eliminados quando a nova migração for aplicada. Não executar sincronização destrutiva do schema como substituto da migração.
- Migrações anteriores, PRD/ADR e registros de IA históricos são preservados por rastreabilidade e identificados como históricos quando necessário.
- Cadastro, autenticação, catálogo, identidade visual e recursos alheios ao gateway mantêm a arquitetura existente.
