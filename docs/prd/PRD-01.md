# PRD — MeLivrei

> Tipo: Produto inicial · Data: 2026-10-28  
> Status: Pronto para planejamento

## Visão geral e objetivo

O MeLivrei será um marketplace web para compra, venda e troca de livros usados entre usuários. A plataforma facilita a publicação e a descoberta de livros, registra negociações e reduz fraudes de pagamento por meio da confirmação de transações pelo gateway Stripe.

O público-alvo é formado por leitores, estudantes e pessoas interessadas em adquirir, vender ou trocar livros usados.

## Decisões do produto

- O sistema será um marketplace entre usuários, e não uma loja administrada pelo grupo.
- Cada anúncio terá uma modalidade: venda ou troca.
- As vendas utilizarão o Stripe em ambiente de testes/sandbox.
- A confirmação de pagamento dependerá da confirmação recebida pelo backend, preferencialmente por webhook, e não de comprovantes enviados pelos usuários.
- A negociação e a entrega física dos livros serão realizadas fora da plataforma; o sistema registrará seus estados e confirmações.

## Regras de negócio e dados

### Usuários e anúncios

- Usuários autenticados podem criar e gerenciar os próprios anúncios.
- Um usuário não pode iniciar uma negociação consigo mesmo.
- Um anúncio deve conter título, autor, descrição, condição, modalidade e usuário proprietário.
- Um anúncio pode ter status disponível, reservado, em negociação, concluído, cancelado ou indisponível.
- Um anúncio pode ter apenas uma negociação ativa por vez.
- Anúncios indisponíveis não aceitam novas solicitações.

### Venda e troca

- A venda fica pendente até a confirmação do Stripe; pagamento recusado ou expirado libera o anúncio novamente.
- O sistema não aceitará comprovante enviado pelo usuário como confirmação de pagamento.
- O interessado deve indicar o livro que oferecerá na troca, que depende do aceite do proprietário do anúncio.
- Após a confirmação de uma troca, os anúncios envolvidos ficam indisponíveis. O cancelamento antes da conclusão pode liberá-los novamente.

### Pagamentos

Os pagamentos de vendas devem possuir estados pendente, aprovado, recusado, expirado e estornado. A aplicação deve armazenar apenas os identificadores e metadados necessários da transação Stripe, sem armazenar dados completos de cartão.

## Fluxos

### Publicar e negociar um livro

1. O usuário autenticado preenche os dados do livro e escolhe venda ou troca.
2. O sistema valida os dados e cria o anúncio como disponível.
3. Outro usuário pesquisa o catálogo e visualiza os detalhes.
4. O interessado inicia uma negociação compatível com a modalidade.
5. O sistema reserva o anúncio e registra a negociação.

### Comprar um livro

1. O comprador inicia a compra e o sistema cria uma transação pendente no Stripe.
2. O comprador conclui o pagamento e o backend recebe e valida a confirmação do Stripe.
3. O sistema aprova a negociação e atualiza o anúncio.
4. O vendedor registra a entrega ou conclusão da negociação.

### Trocar livros

1. O interessado escolhe um anúncio e informa o livro que oferecerá.
2. O proprietário analisa e aceita ou recusa a proposta.
3. Se aceitar, os dois anúncios ficam reservados.
4. Após a confirmação das partes, a troca é concluída e os anúncios ficam indisponíveis.

## Requisitos funcionais

- **RF-001 — Cadastro de usuário:** permitir criar uma conta informando nome, e-mail e senha.
- **RF-002 — Autenticação:** permitir login e logout de usuários cadastrados.
- **RF-003 — Gerenciamento de anúncios:** permitir que um usuário autenticado crie, consulte, edite e remova seus próprios anúncios.
- **RF-004 — Dados do livro:** permitir informar título, autor, descrição, condição, fotos, modalidade e dados financeiros do anúncio.
- **RF-005 — Catálogo:** exibir anúncios disponíveis para usuários autenticados ou visitantes, conforme a política de acesso definida.
- **RF-006 — Pesquisa e filtros:** permitir pesquisar livros por título e autor, além de filtrar por gênero, modalidade, preço e condição.
- **RF-007 — Negociação de venda:** permitir que um interessado solicite a compra de um livro e acompanhe o estado da negociação.
- **RF-008 — Negociação de troca:** permitir que um interessado proponha um livro próprio em troca do livro anunciado, cabendo ao proprietário aceitar ou recusar a proposta.
- **RF-009 — Pagamento Stripe:** criar e acompanhar pagamentos de vendas por meio do Stripe, validando a confirmação recebida pelo backend.
- **RF-010 — Estados de negociação:** atualizar negociações e anúncios conforme eventos de solicitação, pagamento, aceite, cancelamento e conclusão.
- **RF-011 — Histórico:** manter o histórico das principais alterações de anúncios, negociações e pagamentos.

## Requisitos não funcionais

- **RNF-001 — Empacotamento:** o sistema deve ser executável localmente utilizando Docker Compose.
- **RNF-002 — Tecnologias:** o frontend deve utilizar Next.js/React com TypeScript, e o backend deve utilizar NestJS com TypeScript.
- **RNF-003 — Persistência:** os dados persistentes devem ser armazenados em PostgreSQL utilizando Prisma como ORM.
- **RNF-004 — Documentação de API:** o backend deve disponibilizar documentação interativa da API por meio de Swagger/OpenAPI.
- **RNF-005 — Segurança de credenciais:** senhas devem ser armazenadas com hash seguro, nunca em texto puro.
- **RNF-006 — Segurança de pagamentos:** dados completos de cartão não devem ser armazenados pela aplicação; as credenciais do Stripe devem ser protegidas por variáveis de ambiente.
- **RNF-007 — Confiabilidade de pagamentos:** a conclusão de uma venda deve depender de confirmação validada pelo backend, incluindo eventos recebidos por webhook do Stripe.
- **RNF-008 — Testabilidade:** as regras principais de venda, troca e pagamento devem possuir testes automatizados.
- **RNF-009 — Usabilidade:** a interface deve ser responsiva e permitir concluir os fluxos principais em desktop e dispositivos móveis.
- **RNF-010 — Manutenibilidade:** o código deve aplicar orientação a objetos, encapsulamento, separação de responsabilidades e documentação dos módulos principais.
- **RNF-011 — Rastreabilidade:** requisitos, histórias, critérios de aceitação, testes e componentes implementados devem poder ser relacionados por identificadores.
- **RNF-012 — Versionamento:** o projeto deve utilizar Git, commits no padrão Conventional Commits, branches e arquivo `.gitignore`.

## Histórias de usuário e critérios de aceite

| História | Critérios de aceite |
|---|---|
| **US-001 — Criar conta:** como visitante, quero criar uma conta para anunciar livros e participar de negociações. (`RF-001`) | **AC-001:** dados válidos criam a conta. **AC-002:** e-mail já cadastrado é recusado com um motivo. |
| **US-002 — Acessar a conta:** como usuário cadastrado, quero entrar e sair da plataforma com segurança. (`RF-002`) | **AC-003:** credenciais válidas autenticam o usuário. **AC-004:** credenciais inválidas são recusadas sem revelar qual dado está incorreto. |
| **US-003 — Publicar livro:** como usuário, quero criar um anúncio com os dados e fotos do livro. (`RF-003`, `RF-004`) | **AC-005:** campos obrigatórios válidos criam um anúncio disponível. **AC-006:** o proprietário pode editar ou remover seu anúncio. **AC-007:** outro usuário não pode alterá-lo. **AC-008:** campos obrigatórios ausentes impedem a publicação. |
| **US-004 — Encontrar livro:** como visitante ou usuário, quero visualizar, pesquisar e filtrar anúncios. (`RF-005`, `RF-006`) | **AC-009:** o catálogo exibe anúncios disponíveis. **AC-010:** filtros exibem apenas resultados correspondentes. **AC-011:** a ausência de resultados é informada. |
| **US-005 — Comprar livro:** como comprador, quero solicitar a compra e pagar pelo Stripe. (`RF-007`, `RF-009`) | **AC-012:** uma compra válida cria negociação e cobrança pendente. **AC-013:** webhook válido aprova a negociação. **AC-014:** comprovante manual não aprova a negociação. **AC-015:** recusa ou expiração encerra a tentativa e libera o anúncio. |
| **US-006 — Propor troca:** como interessado, quero oferecer um livro próprio em troca de outro. (`RF-008`) | **AC-016:** a proposta vincula os dois anúncios. **AC-017:** o aceite reserva os dois anúncios. **AC-018:** a recusa encerra a negociação sem indisponibilizá-los definitivamente. |
| **US-007 — Acompanhar negociação:** como participante, quero consultar o estado e o histórico de uma negociação. (`RF-010`, `RF-011`) | **AC-019:** uma segunda negociação ativa para o mesmo anúncio é bloqueada. **AC-020:** os participantes visualizam estado atual e histórico relevante. |

## Matriz de rastreabilidade

| Requisito | História | Critérios | Caso de uso | Teste |
|---|---|---|---|---|
| RF-001 | US-001 | AC-001, AC-002 | UC-01 Criar conta | TST-AUTH-01 |
| RF-002 | US-002 | AC-003, AC-004 | UC-02 Autenticar usuário | TST-AUTH-02 |
| RF-003 | US-003 | AC-005, AC-006, AC-007 | UC-03 Gerenciar anúncio | TST-ANN-01 |
| RF-004 | US-003 | AC-005, AC-008 | UC-03 Gerenciar anúncio | TST-ANN-02 |
| RF-005 | US-004 | AC-009 | UC-04 Consultar catálogo | TST-CAT-01 |
| RF-006 | US-004 | AC-010, AC-011 | UC-05 Pesquisar livros | TST-CAT-02 |
| RF-007 | US-005 | AC-012, AC-015 | UC-06 Comprar livro | TST-SALE-01 |
| RF-008 | US-006 | AC-016, AC-017, AC-018 | UC-07 Propor troca | TST-TRADE-01 |
| RF-009 | US-005 | AC-012 a AC-015 | UC-08 Confirmar pagamento | TST-PAY-01 |
| RF-010 | US-007 | AC-019 | UC-09 Acompanhar negociação | TST-NEG-01 |
| RF-011 | US-007 | AC-020 | UC-10 Consultar histórico | TST-AUDIT-01 |

## Stack e restrições técnicas decididas

- Frontend: Next.js com React e TypeScript; backend: NestJS com TypeScript.
- Banco de dados: PostgreSQL, acessado por Prisma.
- Pagamentos: Stripe em ambiente de testes/sandbox; documentação de API: Swagger/OpenAPI.
- Testes automatizados: Jest e testes de integração dos fluxos principais.
- Empacotamento e execução local: Docker Compose.
- A aplicação deve proteger segredos do Stripe por variáveis de ambiente e não deve armazenar dados completos de cartão.
- O sistema deve manter documentação de requisitos, diagramas UML, C4, ADR, README, CHANGELOG e registro de uso de IA.
