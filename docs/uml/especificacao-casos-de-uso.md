# Especificação dos casos de uso principais

Este documento detalha os cinco casos de uso centrais do MeLivrei. Os identificadores devem permanecer alinhados ao diagrama em `casos-de-uso.mmd` e à matriz de rastreabilidade do PRD.

## UC-03 — Gerenciar anúncio

**Atores:** Anunciante.

**Objetivo:** publicar, consultar, editar ou remover um anúncio de livro.

**Pré-condições:** o anunciante está autenticado.

**Fluxo principal — criar anúncio:**

1. O anunciante seleciona a opção de criar anúncio.
2. O sistema solicita os dados do livro, modalidade, condição e informações financeiras.
3. O anunciante preenche os dados obrigatórios.
4. O sistema valida os dados.
5. O sistema cria o anúncio com status `AVAILABLE`.
6. O sistema exibe a confirmação da publicação.

**Fluxos alternativos:**

- Se houver campo obrigatório ausente ou inválido, o sistema informa o erro e não cria o anúncio.
- Se o anunciante editar um anúncio próprio, o sistema valida e salva as alterações.
- Se o anunciante remover um anúncio sem negociação ativa, o sistema altera seu status para `CANCELLED`.
- Se o anúncio possuir negociação ativa, o sistema impede a remoção ou exige o cancelamento da negociação conforme a regra definida.
- Se outro usuário tentar alterar o anúncio, o sistema recusa a operação por falta de permissão.

**Pós-condições:** o anúncio é criado ou atualizado com histórico da operação.

**Requisitos relacionados:** `RF-003`, `RF-004`, `RNF-005`, `RNF-010`.

**Critérios relacionados:** `AC-005` a `AC-008`.

## UC-06 — Comprar livro

**Atores:** Interessado, Anunciante e Stripe.

**Objetivo:** iniciar e concluir a compra de um livro anunciado.

**Pré-condições:** o comprador está autenticado; o anúncio pertence a outro usuário; o anúncio está disponível; a modalidade é venda.

**Fluxo principal:**

1. O interessado seleciona um anúncio disponível.
2. O sistema verifica a disponibilidade e cria uma negociação com status `PENDING_PAYMENT`.
3. O sistema reserva temporariamente o anúncio.
4. O sistema cria uma cobrança no Stripe.
5. O interessado conclui o pagamento no Stripe.
6. O Stripe envia a confirmação ao backend.
7. O backend valida a assinatura e a idempotência do evento.
8. O sistema atualiza o pagamento para `APPROVED`.
9. O sistema atualiza a negociação e o anúncio.
10. O anunciante registra a entrega ou conclusão da venda.

**Fluxos alternativos:**

- Se o anúncio estiver indisponível, o sistema não cria a negociação.
- Se o comprador tentar comprar o próprio anúncio, o sistema bloqueia a operação.
- Se o pagamento for recusado ou expirar, o sistema encerra a tentativa e libera o anúncio.
- Se o usuário enviar somente um comprovante manual, o sistema não confirma o pagamento.
- Se o webhook for inválido ou repetido, o sistema rejeita ou ignora o evento sem duplicar a transação.

**Pós-condições:** em caso de sucesso, a venda é registrada e o anúncio fica reservado ou concluído; em caso de falha, o anúncio volta a ficar disponível.

**Requisitos relacionados:** `RF-007`, `RF-010`, `RF-011`, `RNF-006`, `RNF-007`.

**Critérios relacionados:** `AC-012` a `AC-015`.

## UC-08 — Solicitar empréstimo

**Atores:** Interessado, Proprietário e Stripe.

**Objetivo:** criar um empréstimo com prazo e caução confirmada.

**Pré-condições:** o interessado está autenticado; o anúncio pertence a outro usuário; o anúncio está disponível; a modalidade é empréstimo; prazo e caução são válidos.

**Fluxo principal:**

1. O interessado seleciona o anúncio e consulta prazo, caução e condições.
2. O interessado confirma a solicitação.
3. O sistema cria a negociação com status `PENDING_DEPOSIT`.
4. O sistema cria a cobrança da caução no Stripe.
5. O interessado conclui o pagamento.
6. O Stripe envia a confirmação ao backend.
7. O sistema valida o evento e atualiza a caução para `HELD`.
8. O proprietário registra a entrega do livro.
9. O sistema atualiza o empréstimo para `ACTIVE`.

**Fluxos alternativos:**

- Se o prazo ou a caução forem inválidos, o sistema impede a solicitação.
- Se o pagamento for recusado ou expirar, a negociação é encerrada e o anúncio é liberado.
- Se a caução não for confirmada, o proprietário não pode registrar a entrega.
- Se o interessado tentar solicitar o próprio livro, o sistema bloqueia a operação.

**Pós-condições:** o empréstimo fica ativo após a confirmação da caução e o registro da entrega.

**Requisitos relacionados:** `RF-009`, `RF-010`, `RF-011`, `RNF-006`, `RNF-007`.

**Critérios relacionados:** `AC-019` a `AC-022`.

## UC-11 — Registrar entrega e devolução

**Atores:** Proprietário.

**Objetivo:** registrar a entrega do livro e controlar sua devolução ao final do empréstimo.

**Pré-condições:** para registrar entrega, a caução foi confirmada; para registrar devolução, o empréstimo está ativo.

**Fluxo principal — devolução:**

1. O proprietário acessa o empréstimo ativo.
2. O proprietário informa a data de devolução e a condição observada.
3. O sistema verifica o prazo contratado.
4. O sistema identifica danos selecionados e calcula eventual atraso.
5. O sistema calcula a liquidação da caução.
6. O sistema altera o empréstimo para `RETURNED` ou `UNDER_REVIEW`.
7. O sistema registra o evento no histórico.

**Fluxos alternativos:**

- Se o empréstimo não estiver ativo, o sistema bloqueia o registro da devolução.
- Se a devolução estiver dentro do prazo e sem danos, a caução é liberada integralmente.
- Se houver dano, o sistema aplica os valores da tabela de danos.
- Se houver atraso, o sistema calcula o valor adicional conforme a regra vigente.
- Se o participante contestar a cobrança, o caso passa para `UNDER_REVIEW`.

**Pós-condições:** a devolução, os danos, o atraso e a decisão sobre a caução ficam registrados.

**Requisitos relacionados:** `RF-011`, `RF-012`, `RF-013`, `RF-014`, `RF-015`, `RF-018`.

**Critérios relacionados:** `AC-023` a `AC-028`.

## UC-16 — Analisar conflito

**Atores:** Administrador.

**Objetivo:** analisar uma contestação sobre dano, atraso ou retenção de caução e registrar uma decisão.

**Pré-condições:** o administrador está autenticado; existe uma contestação pendente.

**Fluxo principal:**

1. O administrador consulta a lista de contestações pendentes.
2. O administrador acessa o histórico do empréstimo, da devolução e do pagamento.
3. O administrador analisa a justificativa e as evidências registradas.
4. O administrador escolhe aprovar, alterar ou rejeitar a retenção.
5. O administrador informa uma justificativa obrigatória.
6. O sistema registra a decisão e atualiza o valor final da caução.
7. O sistema altera a contestação para `RESOLVED`.
8. O sistema registra a decisão no histórico.

**Fluxos alternativos:**

- Se o usuário comum tentar acessar a função, o sistema bloqueia a operação.
- Se a contestação não possuir informações suficientes, o administrador pode solicitar complementação e mantê-la pendente.
- Se o administrador cancelar a análise sem decisão, o caso permanece pendente.

**Pós-condições:** a decisão administrativa fica registrada, auditável e vinculada à contestação.

**Requisitos relacionados:** `RF-016`, `RF-017`, `RF-018`, `RNF-005`, `RNF-011`.

**Critérios relacionados:** `AC-029` a `AC-033`.

