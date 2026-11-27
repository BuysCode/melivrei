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

## UC-06 — Propor compra

**Atores:** Interessado e Anunciante.

**Objetivo:** solicitar negociação de compra, sujeita ao aceite do anunciante.

**Pré-condições:** interessado autenticado; anúncio disponível de venda pertencente a outro usuário.

**Fluxo principal:**

1. O interessado envia uma proposta de compra.
2. O sistema reserva o anúncio e cria uma negociação `SALE/PENDING`, com ambos os participantes e auditoria.
3. O anunciante consulta a proposta e aceita ou recusa em UC-11.
4. Após o aceite, o interessado acessa o WhatsApp do anunciante em UC-13.
5. Conversa, pagamento e entrega são combinados externamente.

**Alternativas:** anúncio indisponível, tentativa de comprar o próprio livro ou reserva concorrente impedem a criação. A recusa libera o anúncio e mantém o histórico da proposta recusada.

**Pós-condições:** proposta pendente, aceita ou recusada; nenhum estado financeiro é registrado.

**Requisitos relacionados:** `RF-007`, `RF-010`, `RF-011` do PRD vigente.

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
5. O aceite libera o WhatsApp do anunciante ao interessado em UC-13; conversa e entrega da troca são combinadas externamente.

**Fluxos alternativos:**

- Se algum anúncio estiver indisponível, o sistema não cria a proposta.
- Se o interessado oferecer o próprio anúncio solicitado, o sistema bloqueia a operação.
- Se o proprietário recusar ou qualquer participante cancelar antes da conclusão, o sistema encerra a negociação e libera os anúncios conforme a regra definida.

**Pós-condições:** a proposta de troca é aceita ou recusada, com estado e histórico atualizados; o aceite permite o contato externo.

**Requisitos relacionados:** `RF-008`, `RF-010`, `RF-011`.

**Critérios relacionados:** `AC-016` a `AC-018`.

## UC-11 — Aceitar ou recusar proposta

**Ator:** Anunciante proprietário do anúncio solicitado.

**Pré-condições:** negociação `PENDING`; para aceitar, WhatsApp cadastrado em UC-12.

1. O anunciante decide a proposta de venda ou troca.
2. O sistema altera uma única vez para `APPROVED` ou `REJECTED` e registra autor e decisão na auditoria.
3. Em troca, atualiza também a oferta. A recusa libera o anúncio e, em troca, o livro oferecido; o aceite mantém a reserva.

**Alternativas:** terceiro ou interessado não pode decidir; proposta já respondida não pode ser decidida novamente; falta de WhatsApp impede somente o aceite e orienta o cadastro em Minha conta.

**Critérios relacionados:** `AC-013`, `AC-015`, `AC-021`.

## UC-12 — Cadastrar WhatsApp

**Ator:** Usuário autenticado.

1. Em Minha conta, o usuário informa ou atualiza o próprio WhatsApp com código do país e DDD.
2. O sistema valida de 8 a 15 dígitos, sem zero inicial, e salva somente na conta da sessão.
3. O número permanece fora do catálogo, dos detalhes públicos, da sessão de autenticação e do histórico de negociações.

**Critério relacionado:** `AC-021`.

## UC-13 — Entrar em contato após aceite

**Ator:** Interessado participante da negociação.

1. O sistema verifica participação, estado `APPROVED` e evento de aceite cujo autor é o anunciante.
2. A tela libera “Entrar em contato”, com link para `https://wa.me/<numero>` do anunciante.
3. O interessado abre o WhatsApp e combina venda ou troca externamente.

**Alternativas:** sem sessão, a API exige autenticação; terceiros recebem negociação não encontrada; proposta pendente, recusada, cancelada ou concluída e aprovação financeira legada sem aceite não liberam contato. A restrição também vale para chamadas diretas à API. Contato ainda não cadastrado resulta em mensagem de indisponibilidade.

**Critérios relacionados:** `AC-014`, `AC-022`, `AC-023`.
