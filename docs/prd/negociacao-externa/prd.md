# PRD — MeLivrei: propostas e contato externo

> Tipo: Revisão de escopo do produto existente · Data: 2026-11-27
> Status: Escopo vigente · Substitui PRD-01 nas regras de pagamento e negociação

## Visão geral e objetivo

O MeLivrei será um marketplace web para compra, venda e troca de livros usados entre usuários. A plataforma facilita a publicação e a descoberta de livros, registra negociações e libera o contato externo entre interessados e anunciantes após o aceite de propostas. A redução de escopo foi decidida pelo grupo para adequar a complexidade à realidade do trabalho.

O público-alvo é formado por leitores, estudantes e pessoas interessadas em adquirir, vender ou trocar livros usados.

## Decisões do produto

- O sistema será um marketplace entre usuários, e não uma loja administrada pelo grupo.
- Cada anúncio terá uma modalidade: venda ou troca.
- Venda e troca começam pelo envio de uma proposta de negociação.
- O anunciante aceita ou recusa a proposta na plataforma.
- O botão “Entrar em contato” abre o WhatsApp do anunciante e só é liberado ao interessado participante após o aceite.
- Conversa, pagamento e entrega são combinados externamente entre as partes.
- Cadastro, autenticação, catálogo, anúncios e identidade visual preservam seu escopo anterior.

## Regras de negócio e dados

### Usuários e anúncios

- Usuários autenticados podem criar e gerenciar os próprios anúncios.
- Um usuário não pode iniciar uma negociação consigo mesmo.
- Um anúncio deve conter título, autor, descrição, condição, modalidade e usuário proprietário.
- Um anúncio pode ter status disponível, reservado, em negociação, concluído, cancelado ou indisponível.
- Um anúncio pode ter apenas uma negociação ativa por vez.
- Anúncios indisponíveis não aceitam novas solicitações.

### Venda e troca

- A proposta de venda nasce `PENDING`, com o anúncio `RESERVED`; a proposta de troca mantém ambos os anúncios `IN_NEGOTIATION`.
- Somente o proprietário do anúncio solicitado pode aceitar ou recusar uma proposta pendente. O aceite muda a negociação para `APPROVED`; a recusa muda para `REJECTED` e libera os anúncios envolvidos.
- O interessado deve indicar o livro próprio que oferecerá na troca, que depende do aceite do proprietário do anúncio solicitado.
- O aceite mantém os anúncios reservados para a negociação e não comprova pagamento, entrega ou conclusão da transação externa.
- Uma decisão já registrada não pode ser repetida ou revertida pelos endpoints de aceite/recusa.

### Contato externo

- O anunciante cadastra seu WhatsApp em Minha conta, com código do país, DDD e número. O formulário aceita formatação e envia apenas dígitos; a API aceita de 8 a 15 dígitos, sem zero inicial.
- O número é privado: não integra o catálogo, os detalhes públicos do anúncio, os dados da sessão ou o histórico retornado aos participantes.
- O aceite exige um WhatsApp cadastrado; a ausência orienta o anunciante a cadastrá-lo. A recusa não exige contato.
- O contato só é entregue ao interessado participante quando a negociação está `APPROVED` e há um registro de aceite cujo autor é o anunciante. O mesmo controle vale para chamadas diretas à API.
- Propostas pendentes, recusadas, canceladas ou concluídas e usuários alheios à negociação não liberam contato.
- Aprovação financeira de vendas antigas não equivale a aceite do anunciante.
- O destino de contato é o WhatsApp do anunciante. Conversa, valores, meios de pagamento e entrega são acordados fora do MeLivrei.

## Fluxos

### Publicar e negociar um livro

1. O usuário autenticado preenche os dados do livro e escolhe venda ou troca.
2. O sistema valida os dados e cria o anúncio como disponível.
3. Outro usuário pesquisa o catálogo e visualiza os detalhes.
4. O interessado inicia uma negociação compatível com a modalidade.
5. O sistema reserva o anúncio e registra a negociação.

### Propor compra

1. O interessado envia a proposta para um anúncio de venda disponível de outro usuário.
2. O sistema reserva o anúncio e registra a negociação pendente, seus participantes e histórico.
3. O vendedor aceita ou recusa a proposta. Para aceitar, informa previamente seu WhatsApp em Minha conta.
4. O aceite libera “Entrar em contato” ao interessado; a recusa libera o anúncio novamente.
5. O interessado abre o WhatsApp do anunciante. Conversa, pagamento e entrega ocorrem externamente.

### Trocar livros

1. O interessado escolhe um anúncio e informa o livro próprio que oferecerá.
2. O sistema registra a proposta e mantém ambos os anúncios em negociação.
3. O proprietário do anúncio solicitado aceita ou recusa.
4. O aceite libera ao interessado o WhatsApp do anunciante; a recusa libera os dois anúncios.
5. As partes combinam a troca e a entrega externamente.

## Requisitos funcionais

- **RF-001 — Cadastro de usuário:** permitir criar uma conta informando nome, e-mail e senha.
- **RF-002 — Autenticação:** permitir login e logout de usuários cadastrados.
- **RF-003 — Gerenciamento de anúncios:** permitir que um usuário autenticado crie, consulte, edite e remova seus próprios anúncios.
- **RF-004 — Dados do livro:** permitir informar título, autor, descrição, condição, fotos, modalidade e dados financeiros do anúncio.
- **RF-005 — Catálogo:** exibir anúncios disponíveis para usuários autenticados ou visitantes, conforme a política de acesso definida.
- **RF-006 — Pesquisa e filtros:** permitir pesquisar livros por título e autor, além de filtrar por gênero, modalidade, preço e condição.
- **RF-007 — Negociação de venda:** permitir que um interessado solicite a compra de um livro e acompanhe o estado da negociação.
- **RF-008 — Negociação de troca:** permitir que um interessado proponha um livro próprio em troca do livro anunciado, cabendo ao proprietário aceitar ou recusar a proposta.
- **RF-010 — Estados de negociação:** atualizar negociações e anúncios conforme eventos de solicitação, aceite, cancelamento e conclusão.
- **RF-011 — Histórico:** manter o histórico das principais alterações de anúncios e negociações.

- **RF-013 — Decisão de proposta:** permitir ao anunciante aceitar ou recusar propostas pendentes de venda e troca.
- **RF-014 — Contato após aceite:** liberar o WhatsApp do anunciante somente ao interessado participante após aceite.
- **RF-015 — WhatsApp da conta:** permitir cadastrar, consultar e atualizar o próprio número em Minha conta.

Os requisitos RF-009 e RF-012 foram retirados. Os demais identificadores anteriores são preservados.

## Requisitos não funcionais

- **RNF-001 — Empacotamento:** o sistema deve ser executável localmente utilizando Docker Compose.
- **RNF-002 — Tecnologias:** o frontend deve utilizar Next.js/React com TypeScript, e o backend deve utilizar NestJS com TypeScript.
- **RNF-003 — Persistência:** os dados persistentes devem ser armazenados em PostgreSQL utilizando Prisma como ORM.
- **RNF-004 — Documentação de API:** o backend deve disponibilizar documentação interativa da API por meio de Swagger/OpenAPI.
- **RNF-005 — Segurança de credenciais:** senhas devem ser armazenadas com hash seguro, nunca em texto puro.
- **RNF-008 — Testabilidade:** as regras principais de venda, troca e contato autorizado devem possuir testes automatizados.
- **RNF-009 — Usabilidade:** a interface deve ser responsiva e permitir concluir os fluxos principais em desktop e dispositivos móveis.
- **RNF-010 — Manutenibilidade:** o código deve aplicar orientação a objetos, encapsulamento, separação de responsabilidades e documentação dos módulos principais.
- **RNF-011 — Rastreabilidade:** requisitos, histórias, critérios de aceitação, testes e componentes implementados devem poder ser relacionados por identificadores.
- **RNF-012 — Versionamento:** o projeto deve utilizar Git, commits no padrão Conventional Commits, branches e arquivo `.gitignore`.

- **RNF-013 — Privacidade do contato:** validar sessão, participação, estado e autor do aceite no backend antes de entregar o contato; não incluir o número em respostas públicas.
- **RNF-014 — Integridade da decisão:** a reserva de venda e a decisão de propostas devem ser atômicas, sem duplicar propostas ativas de venda nem sobrescrever respostas.

RNF-006 e RNF-007 foram retirados junto com o processamento financeiro.

## Histórias de usuário e critérios de aceite

| História | Critérios de aceite |
|---|---|
| **US-001 — Criar conta:** como visitante, quero criar uma conta para anunciar livros e participar de negociações. (`RF-001`) | **AC-001:** dados válidos criam a conta. **AC-002:** e-mail já cadastrado é recusado com um motivo. |
| **US-002 — Acessar a conta:** como usuário cadastrado, quero entrar e sair da plataforma com segurança. (`RF-002`) | **AC-003:** credenciais válidas autenticam o usuário. **AC-004:** credenciais inválidas são recusadas sem revelar qual dado está incorreto. |
| **US-003 — Publicar livro:** como usuário, quero criar um anúncio com os dados e fotos do livro. (`RF-003`, `RF-004`) | **AC-005:** campos obrigatórios válidos criam um anúncio disponível. **AC-006:** o proprietário pode editar ou remover seu anúncio. **AC-007:** outro usuário não pode alterá-lo. **AC-008:** campos obrigatórios ausentes impedem a publicação. |
| **US-004 — Encontrar livro:** como visitante ou usuário, quero visualizar, pesquisar e filtrar anúncios. (`RF-005`, `RF-006`) | **AC-009:** o catálogo exibe anúncios disponíveis. **AC-010:** filtros exibem apenas resultados correspondentes. **AC-011:** a ausência de resultados é informada. |
| **US-005 — Propor compra:** como interessado, quero enviar uma proposta e contatar o anunciante após seu aceite. (`RF-007`, `RF-013`, `RF-014`) | **AC-012:** uma proposta válida cria negociação pendente e reserva o anúncio, sem cobrança. **AC-013:** só o anunciante aceita uma proposta pendente, com registro do autor na auditoria. **AC-014:** contato e botão ficam indisponíveis antes do aceite, inclusive por chamada direta. **AC-015:** a recusa libera o anúncio. |
| **US-006 — Propor troca:** como interessado, quero oferecer um livro próprio em troca de outro. (`RF-008`) | **AC-016:** a proposta vincula os dois anúncios. **AC-017:** o aceite reserva os dois anúncios. **AC-018:** a recusa encerra a negociação sem indisponibilizá-los definitivamente. |
| **US-007 — Acompanhar negociação:** como participante, quero consultar o estado e o histórico de uma negociação. (`RF-010`, `RF-011`) | **AC-019:** uma segunda negociação ativa para o mesmo anúncio é bloqueada. **AC-020:** os participantes visualizam estado atual e histórico relevante. |
| **US-008 — Cadastrar contato:** como anunciante, quero informar meu WhatsApp para receber interessados após aceitar propostas. (`RF-015`) | **AC-021:** número válido pode ser atualizado apenas na própria conta; falta de número impede aceite e não impede recusa. |
| **US-009 — Conversar externamente:** como interessado, quero abrir o WhatsApp do anunciante depois do aceite. (`RF-014`) | **AC-022:** só o interessado participante de proposta aceita recebe o link correto. **AC-023:** terceiros, estados sem aceite e aprovações financeiras legadas não liberam contato; o número não aparece nas respostas públicas. |

## Matriz de rastreabilidade

| Requisito | História | Critérios | Caso de uso | Teste |
|---|---|---|---|---|
| RF-001 | US-001 | AC-001, AC-002 | UC-01 Criar conta | TST-AUTH-01 |
| RF-002 | US-002 | AC-003, AC-004 | UC-02 Autenticar usuário | TST-AUTH-02 |
| RF-003 | US-003 | AC-005, AC-006, AC-007 | UC-03 Gerenciar anúncio | TST-ANN-01 |
| RF-004 | US-003 | AC-005, AC-008 | UC-03 Gerenciar anúncio | TST-ANN-02 |
| RF-005 | US-004 | AC-009 | UC-04 Consultar catálogo | TST-CAT-01 |
| RF-006 | US-004 | AC-010, AC-011 | UC-05 Pesquisar livros | TST-CAT-02 |
| RF-007 | US-005 | AC-012, AC-015 | UC-06 Propor compra | negotiations.service.spec.ts |
| RF-008 | US-006 | AC-016, AC-017, AC-018 | UC-07 Propor troca | negotiations.service.spec.ts |
| RF-013 | US-005, US-006 | AC-013, AC-015, AC-021 | UC-11 Decidir proposta | negotiations.service.spec.ts |
| RF-014 | US-009 | AC-014, AC-022, AC-023 | UC-13 Contato após aceite | negotiations.service.spec.ts |
| RF-015 | US-008 | AC-021 | UC-12 Cadastrar WhatsApp | negotiations.service.spec.ts |
| RF-010 | US-007 | AC-019 | UC-09 Acompanhar negociação | TST-NEG-01 |
| RF-011 | US-007 | AC-020 | UC-10 Consultar histórico | TST-AUDIT-01 |

## Stack e restrições técnicas decididas

- Frontend: Next.js com React e TypeScript; backend: NestJS com TypeScript.
- Banco de dados: PostgreSQL, acessado por Prisma.
- Documentação de API: Swagger/OpenAPI.
- Testes automatizados: Jest e testes de integração dos fluxos principais.
- Empacotamento e execução local: Docker Compose.
- O sistema deve manter documentação de requisitos, diagramas UML, C4, ADR, README, CHANGELOG e registro de uso de IA.

## Limite desta revisão e verificação

Os requisitos sem relação com pagamento foram preservados do PRD-01; sua presença não declara nova implementação de edição de anúncios, filtros adicionais, cancelamento ou conclusão. Esta revisão implementa somente a remoção da integração financeira, propostas de venda, aceite/recusa e contato condicionado, preservando o fluxo de troca existente.

A entrega será aceita quando o interessado conseguir propor uma venda ou troca, o anunciante responder e o contato permanecer bloqueado até o aceite, sem dependência de credenciais financeiras. A verificação usa testes de regras e autorização, builds das duas aplicações e validação da migração em banco temporário. Não serão adicionados mecanismos de métricas ou novos fluxos além deste recorte.
