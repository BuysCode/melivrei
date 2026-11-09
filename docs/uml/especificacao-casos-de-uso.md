# Especificação dos casos de uso principais

Este documento detalha os casos de uso centrais do MeLivrei. Os identificadores permanecem alinhados ao diagrama em `casos-de-uso.md` e à matriz de rastreabilidade do PRD.

## UC-03 — Gerenciar anúncio

**Atores:** Anunciante.

**Objetivo:** publicar, consultar, editar ou remover um anúncio de livro para venda ou troca.

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

**Requisitos relacionados:** `RF-007`, `RF-009`, `RF-010`, `RNF-006`, `RNF-007`.

**Critérios relacionados:** `AC-012` a `AC-015`.

## UC-07 — Propor troca

**Atores:** Interessado e Anunciante.

**Objetivo:** propor um livro próprio em troca de outro anúncio disponível.

**Pré-condições:** os dois anúncios pertencem a usuários distintos e estão disponíveis; a modalidade do anúncio solicitado é troca.

**Fluxo principal:**

1. O interessado seleciona o anúncio e informa o livro que oferecerá.
2. O sistema verifica a disponibilidade dos dois anúncios e registra a proposta.
3. O proprietário do anúncio solicitado aceita ou recusa a proposta.
4. Em caso de aceite, o sistema reserva os dois anúncios.
5. Após a confirmação das partes, o sistema conclui a troca e torna os anúncios indisponíveis.

**Fluxos alternativos:**

- Se algum anúncio estiver indisponível, o sistema não cria a proposta.
- Se o interessado oferecer o próprio anúncio solicitado, o sistema bloqueia a operação.
- Se o proprietário recusar ou qualquer participante cancelar antes da conclusão, o sistema encerra a negociação e libera os anúncios conforme a regra definida.

**Pós-condições:** a troca é concluída ou encerrada, com o estado e o histórico da negociação atualizados.

**Requisitos relacionados:** `RF-008`, `RF-010`, `RF-011`.

**Critérios relacionados:** `AC-016` a `AC-018`.
