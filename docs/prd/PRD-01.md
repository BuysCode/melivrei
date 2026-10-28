# PRD — MeLivrei

> Tipo: Produto inicial · Data: 2026-10-28  
> Status: Pronto para planejamento

## Visão geral e objetivo

O MeLivrei será um marketplace web para compra, troca e empréstimo de livros usados entre usuários. A plataforma deve facilitar a publicação e a descoberta de livros, registrar negociações e reduzir fraudes de pagamento por meio da confirmação de transações pelo gateway Stripe.

O público-alvo é formado por leitores, estudantes e pessoas interessadas em adquirir, trocar ou emprestar livros usados.

## Decisões do produto

- O sistema será um marketplace entre usuários, e não uma loja administrada pelo grupo.
- Cada anúncio terá uma modalidade: venda, troca ou empréstimo.
- Vendas e cauções de empréstimos utilizarão o Stripe em ambiente de testes/sandbox.
- A confirmação de pagamento dependerá da confirmação recebida pelo backend, preferencialmente por webhook, e não de comprovantes enviados pelos usuários.
- Em empréstimos, o proprietário definirá o prazo e o valor da caução.
- Danos ao livro terão preços fixos conforme uma tabela de danos.
- Atrasos na devolução gerarão valor variável calculado conforme o tempo de atraso.
- O proprietário poderá registrar a devolução e os danos observados.
- Um administrador poderá revisar danos, multas contestadas e conflitos. A retenção definitiva da caução dependerá dessa revisão quando houver contestação.
- A negociação e a entrega física dos livros serão realizadas fora da plataforma; o sistema registrará seus estados e confirmações.

## Histórias de usuário

- Como usuário, quero criar uma conta e entrar no sistema para participar do marketplace.
- Como anunciante, quero publicar um livro para vendê-lo, trocá-lo ou emprestá-lo.
- Como usuário, quero pesquisar e filtrar livros para encontrar exemplares de meu interesse.
- Como interessado, quero solicitar a compra, a troca ou o empréstimo de um livro.
- Como vendedor, quero receber a confirmação do pagamento antes de concluir uma venda.
- Como interessado em uma troca, quero oferecer um livro próprio para negociar outro exemplar.
- Como proprietário, quero definir prazo e caução para emprestar um livro.
- Como proprietário, quero registrar a devolução e informar danos identificados.
- Como administrador, quero revisar danos, multas contestadas e conflitos para garantir uma decisão registrada.

## Regras de negócio e dados

### Usuários e permissões

- Usuários autenticados podem criar e gerenciar os próprios anúncios.
- Um usuário não pode iniciar uma negociação consigo mesmo.
- Administradores possuem acesso às análises de danos, multas contestadas e conflitos.

### Anúncios

- Um anúncio deve conter título, autor, descrição, condição, modalidade e usuário proprietário.
- O anúncio pode ter status disponível, reservado, em negociação, concluído, cancelado ou indisponível.
- Um anúncio pode ter apenas uma negociação ativa por vez.
- Anúncios indisponíveis não aceitam novas solicitações.

### Venda

- A venda fica pendente até a confirmação do Stripe.
- Durante o pagamento, o anúncio pode ficar reservado.
- Pagamento recusado ou expirado libera o anúncio novamente.
- O sistema não aceitará comprovante enviado pelo usuário como confirmação de pagamento.

### Troca

- O interessado deve indicar o livro que oferecerá na troca.
- A troca depende do aceite do proprietário do anúncio.
- Após a confirmação, os anúncios envolvidos ficam indisponíveis.
- Cancelamento antes da conclusão pode liberar os anúncios novamente.

### Empréstimo

- O proprietário define o prazo e o valor da caução.
- A entrega do livro só pode ser registrada após a confirmação da caução.
- A devolução registra data e condição do exemplar.
- Danos possuem valores fixos definidos em uma tabela configurável do sistema.
- Atrasos possuem valor variável calculado conforme a quantidade de tempo excedida.
- Se não houver danos ou atraso, a caução é liberada integralmente.
- Se houver dano ou atraso, o sistema calcula o valor retido e registra a justificativa.
- Uma contestação pode encaminhar a retenção para análise administrativa.

### Pagamentos

Os pagamentos devem possuir estados pendente, aprovado, recusado, expirado, estornado e parcialmente estornado. A aplicação deve armazenar apenas os identificadores e metadados necessários da transação Stripe, sem armazenar dados completos de cartão.

## Fluxos

### Publicar e negociar um livro

1. O usuário autenticado preenche os dados do livro e escolhe venda, troca ou empréstimo.
2. O sistema valida os dados e cria o anúncio como disponível.
3. Outro usuário pesquisa o catálogo e visualiza os detalhes.
4. O interessado inicia uma negociação compatível com a modalidade.
5. O sistema reserva o anúncio e registra a negociação.

### Comprar um livro

1. O comprador inicia a compra.
2. O sistema cria uma transação pendente no Stripe.
3. O comprador conclui o pagamento no Stripe.
4. O backend recebe e valida a confirmação do Stripe.
5. O sistema aprova a negociação e atualiza o anúncio.
6. O vendedor registra a entrega ou conclusão da negociação.

### Trocar livros

1. O interessado escolhe um anúncio e informa o livro que oferecerá.
2. O proprietário analisa e aceita ou recusa a proposta.
3. Se aceitar, os dois anúncios ficam reservados.
4. Após a confirmação das partes, a troca é concluída e os anúncios ficam indisponíveis.

### Emprestar e devolver um livro

1. O interessado solicita o empréstimo.
2. O sistema apresenta prazo, caução e condições.
3. O interessado paga a caução pelo Stripe.
4. Após a confirmação do pagamento, o proprietário registra a entrega.
5. O interessado devolve o livro e o proprietário registra a condição e a data.
6. O sistema calcula danos fixos e eventual atraso.
7. Sem pendências, a caução é liberada; com pendências, o valor é retido conforme as regras.
8. Se houver contestação, um administrador revisa o caso e registra a decisão.

## Critérios de aceite

- Dado um usuário não autenticado, quando ele tentar criar um anúncio, então o sistema deve exigir autenticação.
- Dado um anúncio disponível, quando outro usuário pesquisar por título ou autor, então o anúncio correspondente deve aparecer nos resultados.
- Dado um usuário tentando negociar consigo mesmo, quando iniciar a negociação, então o sistema deve recusar a operação.
- Dado um pagamento pendente, quando o Stripe enviar confirmação aprovada ao backend, então a negociação deve ser atualizada para paga.
- Dado um comprovante enviado manualmente pelo usuário, quando não houver confirmação do Stripe, então a negociação não deve ser concluída.
- Dado um pagamento recusado ou expirado, quando o evento for processado, então o anúncio deve voltar a ficar disponível.
- Dado um empréstimo com devolução sem danos e dentro do prazo, quando a devolução for registrada, então a caução deve ser liberada integralmente.
- Dado um livro com página rasgada, quando o dano for registrado, então o sistema deve aplicar o valor fixo correspondente da tabela.
- Dado um empréstimo devolvido após o prazo, quando a devolução for registrada, então o sistema deve calcular o valor adicional com base no tempo de atraso.
- Dado um caso contestado, quando o administrador registrar sua decisão, então o sistema deve manter o histórico da análise e do valor final da caução.
- Dado um anúncio com negociação ativa, quando outro usuário tentar iniciar nova negociação, então o sistema deve bloquear a operação.

## Stack e restrições técnicas decididas

- Frontend: Next.js com React e TypeScript.
- Backend: NestJS com TypeScript.
- Banco de dados: PostgreSQL.
- Persistência: Prisma.
- Pagamentos: Stripe em ambiente de testes/sandbox.
- Documentação de API: Swagger/OpenAPI.
- Testes automatizados: Jest e testes de integração dos fluxos principais.
- Empacotamento e execução local: Docker Compose.
- A aplicação deve proteger segredos do Stripe por variáveis de ambiente e não deve armazenar dados completos de cartão.
- O sistema deve manter documentação de requisitos, diagramas UML, C4, ADR, README, CHANGELOG e registro de uso de IA.

## Requisitos funcionais

- **RF-001 — Cadastro de usuário:** o sistema deve permitir que uma pessoa crie uma conta informando nome, e-mail e senha.
- **RF-002 — Autenticação:** o sistema deve permitir login e logout de usuários cadastrados.
- **RF-003 — Gerenciamento de anúncios:** o sistema deve permitir que um usuário autenticado crie, consulte, edite e remova seus próprios anúncios.
- **RF-004 — Dados do livro:** o sistema deve permitir informar título, autor, descrição, condição, fotos, modalidade e dados financeiros do anúncio.
- **RF-005 — Catálogo:** o sistema deve exibir anúncios disponíveis para usuários autenticados ou visitantes, conforme a política de acesso definida.
- **RF-006 — Pesquisa e filtros:** o sistema deve permitir pesquisar livros por título e autor, além de filtrar por gênero, modalidade, preço e condição.
- **RF-007 — Negociação de venda:** o sistema deve permitir que um interessado solicite a compra de um livro e acompanhe o estado da negociação.
- **RF-008 — Negociação de troca:** o sistema deve permitir que um interessado proponha um livro próprio em troca do livro anunciado, cabendo ao proprietário aceitar ou recusar a proposta.
- **RF-009 — Negociação de empréstimo:** o sistema deve permitir solicitar empréstimos com prazo, caução e condições definidos pelo proprietário.
- **RF-010 — Pagamento Stripe:** o sistema deve criar e acompanhar pagamentos de vendas e cauções por meio do Stripe, validando a confirmação recebida pelo backend.
- **RF-011 — Estados de negociação:** o sistema deve atualizar negociações e anúncios conforme eventos de solicitação, pagamento, aceite, cancelamento, entrega, devolução e conclusão.
- **RF-012 — Registro de entrega e devolução:** o sistema deve permitir registrar a entrega e a devolução de livros emprestados.
- **RF-013 — Avaliação de danos:** o sistema deve permitir registrar danos identificados na devolução e associá-los aos valores fixos da tabela de danos.
- **RF-014 — Cálculo de atraso:** o sistema deve calcular o valor adicional devido por atraso na devolução, considerando o tempo excedido e a regra vigente.
- **RF-015 — Caução:** o sistema deve registrar a liberação, retenção ou devolução parcial da caução de um empréstimo.
- **RF-016 — Contestação:** o sistema deve permitir contestar uma cobrança relacionada a dano, atraso ou retenção de caução.
- **RF-017 — Administração de conflitos:** o sistema deve permitir que um administrador analise contestações e registre a decisão final.
- **RF-018 — Histórico:** o sistema deve manter o histórico das principais alterações de anúncios, negociações, pagamentos, devoluções e decisões administrativas.

## Requisitos não funcionais

- **RNF-001 — Empacotamento:** o sistema deve ser executável localmente utilizando Docker Compose.
- **RNF-002 — Tecnologias:** o frontend deve utilizar Next.js/React com TypeScript, e o backend deve utilizar NestJS com TypeScript.
- **RNF-003 — Persistência:** os dados persistentes devem ser armazenados em PostgreSQL utilizando Prisma como ORM.
- **RNF-004 — Documentação de API:** o backend deve disponibilizar documentação interativa da API por meio de Swagger/OpenAPI.
- **RNF-005 — Segurança de credenciais:** senhas devem ser armazenadas com hash seguro, nunca em texto puro.
- **RNF-006 — Segurança de pagamentos:** dados completos de cartão não devem ser armazenados pela aplicação; as credenciais do Stripe devem ser protegidas por variáveis de ambiente.
- **RNF-007 — Confiabilidade de pagamentos:** a conclusão de uma venda ou empréstimo deve depender de confirmação validada pelo backend, incluindo eventos recebidos por webhook do Stripe.
- **RNF-008 — Testabilidade:** as regras principais de venda, troca, empréstimo, caução, dano, atraso e pagamento devem possuir testes automatizados.
- **RNF-009 — Usabilidade:** a interface deve ser responsiva e permitir concluir os fluxos principais em desktop e dispositivos móveis.
- **RNF-010 — Manutenibilidade:** o código deve aplicar orientação a objetos, encapsulamento, separação de responsabilidades e documentação dos módulos principais.
- **RNF-011 — Rastreabilidade:** requisitos, histórias, critérios de aceitação, testes e componentes implementados devem poder ser relacionados por identificadores.
- **RNF-012 — Versionamento:** o projeto deve utilizar Git, commits no padrão Conventional Commits, branches e arquivo `.gitignore`.

## Histórias de usuário detalhadas

- **US-001 — Criar conta:** como visitante, quero criar uma conta com meus dados para poder anunciar livros e participar de negociações. Relacionada a `RF-001`.
- **US-002 — Acessar a conta:** como usuário cadastrado, quero entrar e sair da plataforma com segurança para acessar minhas funcionalidades. Relacionada a `RF-002`.
- **US-003 — Publicar livro:** como usuário, quero criar um anúncio com os dados e fotos do livro para disponibilizá-lo no marketplace. Relacionada a `RF-003` e `RF-004`.
- **US-004 — Gerenciar meu anúncio:** como anunciante, quero editar ou remover meus anúncios para manter as informações atualizadas. Relacionada a `RF-003`.
- **US-005 — Encontrar livro:** como visitante ou usuário, quero visualizar, pesquisar e filtrar anúncios para encontrar um livro de meu interesse. Relacionada a `RF-005` e `RF-006`.
- **US-006 — Comprar livro:** como comprador, quero solicitar a compra e pagar pelo Stripe para concluir a negociação com mais segurança. Relacionada a `RF-007` e `RF-010`.
- **US-007 — Propor troca:** como interessado, quero oferecer um livro próprio em troca de outro para realizar uma negociação sem compra direta. Relacionada a `RF-008`.
- **US-008 — Solicitar empréstimo:** como interessado, quero solicitar um empréstimo conhecendo o prazo e a caução para decidir se aceito as condições. Relacionada a `RF-009`.
- **US-009 — Acompanhar negociação:** como participante, quero acompanhar o estado da negociação para saber se ela está pendente, aprovada, recusada, cancelada ou concluída. Relacionada a `RF-011`.
- **US-010 — Registrar devolução:** como proprietário, quero registrar a entrega e a devolução do livro emprestado para controlar o empréstimo. Relacionada a `RF-012`.
- **US-011 — Registrar danos e atraso:** como proprietário, quero informar danos e atraso na devolução para que o sistema calcule o valor a ser retido da caução. Relacionada a `RF-013`, `RF-014` e `RF-015`.
- **US-012 — Contestar cobrança:** como participante de um empréstimo, quero contestar uma cobrança que considero indevida para solicitar revisão. Relacionada a `RF-016`.
- **US-013 — Analisar conflito:** como administrador, quero analisar contestações e registrar uma decisão para resolver conflitos de forma rastreável. Relacionada a `RF-017` e `RF-018`.

## Matriz completa de rastreabilidade

| Requisito | História | Critérios de aceitação | Caso de uso | Teste |
|---|---|---|---|---|
| RF-001 | US-001 | AC-001, AC-002 | UC-01 Criar conta | TST-AUTH-01 |
| RF-002 | US-002 | AC-003, AC-004 | UC-02 Autenticar usuário | TST-AUTH-02 |
| RF-003 | US-003, US-004 | AC-005, AC-006, AC-007 | UC-03 Gerenciar anúncio | TST-ANN-01 |
| RF-004 | US-003 | AC-005, AC-008 | UC-03 Gerenciar anúncio | TST-ANN-02 |
| RF-005 | US-005 | AC-009 | UC-04 Consultar catálogo | TST-CAT-01 |
| RF-006 | US-005 | AC-010, AC-011 | UC-05 Pesquisar livros | TST-CAT-02 |
| RF-007 | US-006 | AC-012, AC-015 | UC-06 Comprar livro | TST-SALE-01 |
| RF-008 | US-007 | AC-016, AC-017, AC-018 | UC-07 Propor troca | TST-TRADE-01 |
| RF-009 | US-008 | AC-019, AC-020 | UC-08 Solicitar empréstimo | TST-LOAN-01 |
| RF-010 | US-006, US-008 | AC-012, AC-013, AC-014, AC-015, AC-019, AC-020 | UC-09 Confirmar pagamento | TST-PAY-01 |
| RF-011 | US-009 | AC-021, AC-022 | UC-10 Acompanhar negociação | TST-NEG-01 |
| RF-012 | US-010 | AC-023, AC-024 | UC-11 Registrar devolução | TST-LOAN-02 |
| RF-013 | US-011 | AC-025, AC-028 | UC-12 Avaliar danos | TST-DAMAGE-01 |
| RF-014 | US-011 | AC-026 | UC-13 Calcular atraso | TST-LOAN-03 |
| RF-015 | US-011 | AC-027, AC-028 | UC-14 Liquidar caução | TST-DEPOSIT-01 |
| RF-016 | US-012 | AC-029, AC-030 | UC-15 Contestar cobrança | TST-DISPUTE-01 |
| RF-017 | US-013 | AC-031, AC-032, AC-033 | UC-16 Analisar conflito | TST-ADMIN-01 |
| RF-018 | US-009, US-013 | AC-022, AC-032 | UC-17 Consultar histórico | TST-AUDIT-01 |
| RNF-001 | — | Evidência de execução em Docker Compose | UC-18 Executar ambiente | TST-INFRA-01 |
| RNF-002 | — | Verificação da stack no repositório | UC-19 Verificar stack | TST-STACK-01 |
| RNF-003 | — | Persistência validada em PostgreSQL via Prisma | UC-20 Persistir dados | TST-DATA-01 |
| RNF-004 | — | Swagger disponível e documentado | UC-21 Consultar API | TST-DOC-01 |
| RNF-005 | — | Senhas armazenadas somente como hash | UC-22 Proteger credenciais | TST-SEC-01 |
| RNF-006 | — | Sem dados de cartão ou segredos no código | UC-23 Proteger pagamento | TST-SEC-02 |
| RNF-007 | — | Venda/caução concluída somente após webhook válido | UC-09 Confirmar pagamento | TST-PAY-02 |
| RNF-008 | — | Testes automatizados das regras principais | UC-24 Executar testes | TST-QUALITY-01 |
| RNF-009 | — | Fluxos principais utilizáveis em desktop e mobile | UC-25 Usar interface | TST-UX-01 |
| RNF-010 | — | Código organizado e documentado | UC-26 Inspecionar código | TST-CODE-01 |
| RNF-011 | — | Identificadores presentes nos artefatos | UC-27 Auditar rastreabilidade | TST-TRACE-01 |
| RNF-012 | — | Git com commits, branches e `.gitignore` | UC-28 Auditar versionamento | TST-GIT-01 |

### Convenções da matriz

- `RF` identifica requisito funcional; `RNF` identifica requisito não funcional.
- `US` identifica história de usuário.
- `AC` identifica critério de aceitação.
- `UC` identifica caso de uso a ser detalhado no modelo UML.
- `TST` identifica o teste ou evidência a ser criado durante a implementação.
- Os identificadores `UC` e `TST` são provisórios e poderão ser ajustados durante a modelagem e a implementação.

## Critérios de aceitação por história

### US-001 — Criar conta

- **AC-001:** Dado que o visitante informa nome, e-mail válido e senha válida, quando enviar o cadastro, então o sistema deve criar a conta e informar que o cadastro foi concluído.
- **AC-002:** Dado que o e-mail já está cadastrado, quando o visitante tentar criar outra conta com o mesmo e-mail, então o sistema deve recusar o cadastro e informar o motivo.

### US-002 — Acessar a conta

- **AC-003:** Dado que o usuário possui credenciais válidas, quando realizar o login, então o sistema deve autenticá-lo e disponibilizar suas funcionalidades privadas.
- **AC-004:** Dado que as credenciais são inválidas, quando o usuário tentar realizar o login, então o sistema deve recusar o acesso sem revelar qual dado está incorreto.

### US-003 e US-004 — Publicar e gerenciar livro

- **AC-005:** Dado que o usuário está autenticado e informa todos os campos obrigatórios, quando publicar o livro, então o sistema deve criar o anúncio como disponível.
- **AC-006:** Dado que um anúncio pertence ao usuário autenticado, quando ele editar ou remover o anúncio, então o sistema deve aplicar a alteração e registrar o evento.
- **AC-007:** Dado que um anúncio pertence a outro usuário, quando alguém tentar editá-lo ou removê-lo, então o sistema deve bloquear a operação.
- **AC-008:** Dado que um campo obrigatório não foi informado, quando o usuário tentar publicar o anúncio, então o sistema deve impedir o cadastro e indicar os campos pendentes.

### US-005 — Encontrar livro

- **AC-009:** Dado que existem anúncios disponíveis, quando o usuário acessar o catálogo, então o sistema deve exibir os anúncios disponíveis com suas informações principais.
- **AC-010:** Dado que existem anúncios compatíveis, quando o usuário pesquisar por título, autor ou aplicar filtros, então o sistema deve exibir apenas os resultados correspondentes.
- **AC-011:** Dado que nenhum anúncio corresponde aos critérios informados, quando a pesquisa for realizada, então o sistema deve informar que não foram encontrados resultados.

### US-006 — Comprar livro

- **AC-012:** Dado que o anúncio está disponível e pertence a outro usuário, quando o comprador iniciar a compra, então o sistema deve criar uma negociação e uma cobrança pendente no Stripe.
- **AC-013:** Dado que o Stripe confirmou o pagamento por evento válido, quando o backend processar o evento, então a negociação deve ser aprovada e o anúncio deve ser reservado ou concluído conforme o fluxo definido.
- **AC-014:** Dado que o usuário envia apenas um comprovante manual, quando não existir confirmação do Stripe, então o sistema não deve aprovar a negociação.
- **AC-015:** Dado que o Stripe recusou ou expirou o pagamento, quando o backend processar o evento, então a negociação deve ser encerrada e o anúncio deve voltar a ficar disponível.

### US-007 — Propor troca

- **AC-016:** Dado que o usuário possui um anúncio próprio disponível, quando propor uma troca, então o sistema deve registrar a proposta vinculando os dois anúncios.
- **AC-017:** Dado que o proprietário aceita a proposta, quando confirmar o aceite, então o sistema deve reservar os dois anúncios e atualizar a negociação.
- **AC-018:** Dado que o proprietário recusa a proposta, quando confirmar a recusa, então o sistema deve encerrar a negociação sem indisponibilizar definitivamente os anúncios.

### US-008 e US-009 — Solicitar empréstimo e acompanhar negociação

- **AC-019:** Dado que o anúncio é de empréstimo e possui prazo e caução válidos, quando o interessado solicitar o empréstimo, então o sistema deve criar a negociação e a cobrança da caução no Stripe.
- **AC-020:** Dado que a caução foi confirmada pelo Stripe, quando o backend processar a confirmação, então o proprietário deve poder registrar a entrega do livro.
- **AC-021:** Dado que existe uma negociação ativa para o anúncio, quando outro usuário tentar iniciar nova negociação, então o sistema deve bloquear a solicitação.
- **AC-022:** Dado que a negociação possui eventos registrados, quando um participante consultar seus detalhes, então o sistema deve exibir o estado atual e o histórico relevante.

### US-010 — Registrar devolução

- **AC-023:** Dado que o empréstimo está ativo, quando o proprietário registrar a devolução, então o sistema deve armazenar a data e a condição informada para o livro.
- **AC-024:** Dado que o empréstimo não está ativo, quando alguém tentar registrar devolução, então o sistema deve bloquear a operação.

### US-011 — Registrar danos e atraso

- **AC-025:** Dado que a devolução possui dano cadastrado na tabela, quando o proprietário registrar o dano, então o sistema deve aplicar o valor fixo correspondente.
- **AC-026:** Dado que a devolução ocorreu após o prazo, quando o proprietário registrar a devolução, então o sistema deve calcular o valor variável conforme o tempo de atraso.
- **AC-027:** Dado que não há dano nem atraso, quando a devolução for concluída, então o sistema deve liberar integralmente a caução.
- **AC-028:** Dado que há dano ou atraso, quando a devolução for concluída, então o sistema deve registrar o valor retido e o motivo.

### US-012 — Contestar cobrança

- **AC-029:** Dado que existe uma retenção de caução, quando o participante abrir uma contestação, então o sistema deve registrar o motivo e encaminhar o caso para análise administrativa.
- **AC-030:** Dado que não existe uma cobrança ou retenção associada, quando o usuário tentar contestar, então o sistema deve bloquear a operação.

### US-013 — Analisar conflito

- **AC-031:** Dado que existe uma contestação pendente, quando um administrador analisar o caso, então ele deve poder aprovar, alterar ou rejeitar a retenção com uma justificativa.
- **AC-032:** Dado que o administrador finalizou a análise, quando a decisão for registrada, então o sistema deve atualizar a caução e manter o histórico da decisão.
- **AC-033:** Dado que um usuário comum tenta acessar a análise administrativa, quando solicitar a operação, então o sistema deve bloquear o acesso.

