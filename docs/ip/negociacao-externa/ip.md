# Implementation Plan — Propostas e contato externo

> Data: 2026-11-27 · Status: Implementação concluída; migração do banco persistente pendente de implantação.

## Objetivo e referências

Executar a redução de escopo definida pelo grupo: retirar a integração financeira e liberar contato pelo WhatsApp somente após aceite de uma proposta de venda ou troca. Referências: [PRD vigente](../../prd/negociacao-externa/prd.md), [ADR-002](../../adr/negociacao-externa/adr.md), C4 e UML em `docs/arquitetura` e `docs/uml`.

Preservar funcionalidades sem relação com a integração, especialmente cadastro, autenticação, catálogo, anúncios, identidade visual, auditoria de negociação e estrutura de frontend/API/banco. Não implementar novos filtros, edição de anúncios ou novas transições de cancelamento/conclusão nesta revisão.

## Pré-requisitos

- Node.js 24+, dependências instaladas e PostgreSQL compatível com o schema existente.
- Para ambiente persistente: backup e identificação do histórico de migrações, especialmente se o banco foi criado por `db push`.
- `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` e `FRONTEND_URL` configurados. Nenhuma credencial financeira é necessária.

## Tarefas ordenadas e critérios de conclusão

| ID | Dependência | Área/arquivos | Resultado e critério | Estado |
|---|---|---|---|---|
| TASK-001 | Pedido do grupo | PRD, ADR-002 | Regras de proposta, decisão, contato e limites registrados; requisitos não financeiros preservados | Concluída |
| TASK-002 | TASK-001 | `backend/prisma/schema.prisma`, migração `20261127000000_external_negotiation_contact` | Telefone privado opcional; estado pendente financeiro convertido; estruturas financeiras removidas sem excluir usuários, anúncios ou propostas | Concluída; aplicação em banco persistente pendente |
| TASK-003 | TASK-002 | `backend/src/payments`, `app.module.ts`, módulo/serviço/DTOs/controlador de negociações | Módulo financeiro eliminado; proposta de venda `PENDING`; aceite/recusa do anunciante; contato protegido por sessão, participação e evento de aceite | Concluída |
| TASK-004 | TASK-003 | `frontend/src/components`, rotas de negociação/checkout/pagamento, `src/lib/api.ts`, `globals.css` | SDK e checkout removidos; conta cadastra WhatsApp; proposta aceita libera link somente ao interessado; estilo restante preservado | Concluída |
| TASK-005 | TASK-004 | Exemplos de ambiente, manifests/lockfile, Dockerfile frontend e Compose | Variáveis e dependências financeiras removidas; Compose aplica migrações versionadas, necessárias para a retirada de tabelas | Concluída |
| TASK-006 | TASK-004 | READMEs, textos de produto sobre pagamentos/privacidade, C4, UML, `AI_USAGE.md` | Documentação vigente reflete propostas e contato externo; UML exclusivo da integração removido; históricos identificados | Concluída |
| TASK-007 | TASK-003 a TASK-006 | Testes, lint, builds e migração temporária | Regras, autorização, recusa, formato do número e compatibilidade de dados verificadas | Concluída conforme evidências abaixo |
| TASK-008 | TASK-007 | Ambiente de implantação | Aplicar migração persistente, cadastrar WhatsApp e executar venda e troca com duas contas | Pendente na implantação |

## Contratos e invariantes

- `POST /api/negotiations/purchases`: `{ listingId }`; cria `SALE/PENDING`, reserva `RESERVED` e registra participantes e evento `SALE_PROPOSED`. Campo legado `deferCheckout` deixa de ser aceito.
- `POST /api/negotiations/trades`: contrato existente preservado; mantém a reserva existente dos dois anúncios como `IN_NEGOTIATION`.
- `PATCH /api/negotiations/:id/accept` e `/reject`: somente proprietário; exige `PENDING`; aceite exige contato. Atualização condicional e auditoria na mesma transação. Recusa libera os anúncios.
- `GET/PATCH /api/negotiations/contact-profile`: consulta/atualiza somente o WhatsApp do usuário autenticado; PATCH recebe `{ whatsappNumber }`, com 8 a 15 dígitos internacionais sem zero inicial.
- `GET /api/negotiations/:id`: participante recebe negociação e `canContact`, sem telefone.
- `GET /api/negotiations/:id/contact`: interessado participante recebe `{ url: "https://wa.me/<numero>" }` somente em `APPROVED` com evento `SALE_ACCEPTED` ou `TRADE_ACCEPTED` cujo autor é o proprietário.
- Ausência de sessão: 401. Terceiro consultando negociação/contato: 404. Contato sem aceite ou tentativa de decidir como interessado: 403. Número inválido/faltante no aceite ou proposta já respondida: 400. Decisão/reserva concorrente: conflito sem efeitos parciais.
- Aceite significa autorização para contato; conversa, pagamento e entrega são externos. Estados antigos de aprovação financeira não concedem contato.

## Dados, migração e implantação

1. Fazer backup do banco persistente antes da migração, que elimina dados financeiros e tokens.
2. Conferir `_prisma_migrations`. Em banco criado por `db push`, seguir o procedimento de baseline do README do backend; não marcar alterações ausentes como aplicadas.
3. Executar `npm run prisma:generate` e `npx prisma migrate deploy` em `backend`, ou iniciar o Compose atualizado, cujo serviço de schema executa `prisma migrate deploy`.
4. A migração adiciona `User.whatsappNumber` nulo, converte `PENDING_PAYMENT` em `PENDING`, preserva a reserva e remove somente tabelas/tipo/eventos exclusivos de pagamentos. Os outros estados e dados de negociação continuam iguais.
5. Manter migrações anteriores para upgrades e criação de banco vazio. PRD-01, ADR-001 e IP anterior preservam o histórico; a ADR-002 e este plano substituem as partes financeiras.
6. Pedir aos anunciantes que cadastrem seu WhatsApp em Minha conta antes de aceitar propostas. Números ausentes não são inventados nem importados da integração removida.

## Verificações executadas

- Backend: `npm test -- --runInBand` — 35 testes aprovados, incluindo três testes existentes de anúncios e 32 casos de propostas/contato.
- Backend: `npm run lint` e `npm run build` — aprovados; cliente Prisma regenerado e schema formatado.
- Frontend: `npm run lint` e `npm run build` — aprovados; rotas antigas de checkout/pagamento ausentes do build.
- Cadeia completa de migrações executada em PostgreSQL temporário PGlite: schema inicial + integração antiga + migração de redução. Conferidos conversão da compra pendente, manutenção de venda historicamente aprovada, reservas, participantes, usuários e auditoria não financeira; tabelas e tipo de pagamento eliminados.
- Smoke HTTP executado com Better Auth, NestJS e PostgreSQL temporário: três usuários, proposta/aceite/recusa de venda, troca, contato bloqueado antes do aceite, acesso autorizado após aceite e privacidade no catálogo/sessão/detalhes; endpoints financeiros retornam 404.
- Smoke Chromium com Playwright e respostas controladas: botão oculto antes do aceite e link correto após atualização, aceite pelo anunciante, cadastro normalizado do número, proposta de troca, desktop e mobile sem overflow e rotas antigas retornando 404. Sem erros de JavaScript nos cenários.
- Busca no código ativo e nos diagramas: nenhuma referência à integração, SDK, webhook, checkout ou `PENDING_PAYMENT`; os nomes antigos permanecem apenas nas migrações e documentos históricos ou na documentação da retirada.

## Riscos e limites

- O banco persistente do projeto não foi migrado nesta execução. A aplicação depende da nova coluna e requer aplicação da migração antes do uso.
- O formato do número não verifica titularidade nem existência de conta no WhatsApp; o anunciante deve manter seu contato correto.
- O aceite mantém as reservas do fluxo anterior. Esta revisão não adiciona transições de conclusão ou cancelamento que não existiam na implementação.
- A migração é destrutiva apenas para dados de pagamento. Reversão exigiria restauração do backup; reintroduzir gateway está fora deste plano.
- Docker Compose não foi executado neste ambiente, que não disponibiliza o comando Docker.
- Ferramentas Ruflo/ToolSearch não estão disponíveis na sessão; inspeção e validações ocorreram por ferramentas locais.
