# Registro de uso de IA — MeLivrei

Este documento registra os usos da IA como apoio ao planejamento, à documentação, à implementação e à validação do projeto MeLivrei.

## 1. Estruturação inicial da documentação do projeto

A IA auxiliou na elaboração do PRD, dos diagramas UML de casos de uso, classes e sequência, além dos diagramas C4 de contexto e containers, para registrar problema, escopo, atores, fluxos e arquitetura inicial do marketplace.

## 2. Atualização do nome do produto para MeLivrei

A IA apoiou a substituição da nomenclatura anterior “Brique Literário” por “MeLivrei” nos documentos arquiteturais e na definição do produto, mantendo a documentação coerente com a identidade escolhida pelo grupo.

## 3. Definição da arquitetura e da stack

A IA ajudou a registrar a decisão arquitetural do projeto, incluindo a organização em monorepo, frontend em Next.js, backend em NestJS, banco PostgreSQL, Prisma como ORM, Better Auth para autenticação e Stripe para pagamentos.

## 4. Criação da base do frontend e backend

A IA auxiliou na configuração inicial dos projetos frontend e backend, com dependências, scripts, estrutura de diretórios, testes e configurações de TypeScript necessárias para iniciar o desenvolvimento.

## 5. Adequação do backend ao uso de módulos ECMAScript

A IA apoiou a correção dos imports e das configurações do backend para compatibilidade com módulos ECMAScript, evitando erros de execução e de testes no ambiente Node.js.

## 6. Implementação da API de anúncios, vendas e trocas

A IA colaborou na construção da API para cadastrar e consultar anúncios, iniciar compras e propostas de troca, aceitar ou recusar negociações e registrar os estados do processo no banco de dados.

## 7. Modelagem do banco de dados com Prisma

A IA auxiliou na modelagem das entidades de usuários, livros, anúncios, imagens, negociações, propostas de troca, pagamentos, eventos de pagamento, auditoria e autenticação, incluindo relacionamentos e regras de integridade.

## 8. Integração do fluxo de pagamentos com Stripe

A IA apoiou a integração do backend com o Stripe para criar intenções de pagamento, tratar webhooks, impedir o reprocessamento de eventos e atualizar o status de pagamentos, anúncios e negociações.

## 9. Implementação da autenticação com Better Auth

A IA auxiliou na substituição da autenticação anterior por Better Auth, com sessões persistidas no PostgreSQL, rotas de cadastro e login, proteção de rotas da API e comunicação com o cliente web.

## 10. Criação da identidade visual do MeLivrei

A IA contribuiu para a criação e organização da identidade visual, com estudos de logotipo, versões finais, ícones, favicons, guia de uso e materiais de apresentação da marca.

## 11. Atualização da camada de dados para Prisma 7

A IA apoiou a atualização para Prisma 7, adequando a configuração do Prisma, o adaptador de conexão PostgreSQL e os pontos do backend que dependem do cliente de banco de dados.

## 12. Construção das telas completas do frontend

A IA auxiliou na implementação das páginas de início, catálogo, detalhes do livro, autenticação, criação de conta, publicação de anúncio e negociação, com componentes reutilizáveis, estilos e estados de carregamento e erro.

## 13. Preparação da demonstração com dados simulados

A IA apoiou a adaptação do frontend para uma demonstração independente do backend, usando dados fictícios e `localStorage` para demonstrar anúncios, usuários, compras, trocas, edição e reinicialização de dados durante o pitch.

## 14. Atualização de segurança do frontend

A IA identificou e aplicou a atualização do Next.js para a versão 16.4.6, preservando a configuração do projeto e reduzindo a exposição a problemas corrigidos pela versão mais recente.

## 15. Configuração do ambiente Docker

A IA configurou containers para PostgreSQL, API NestJS/Prisma e frontend Next.js, com Dockerfiles, Compose para execução padrão e desenvolvimento com recarregamento automático, healthchecks, variáveis de ambiente e sincronização do schema do banco para o ambiente local.

## 16. Criação do README geral do projeto

A IA criou o README da raiz do repositório, consolidando a visão geral do MeLivrei, stack, estrutura de pastas, instruções para executar frontend, backend e Docker, comandos de qualidade, resumos da documentação, diagramas C4/UML, variáveis de ambiente e limitações atuais.
