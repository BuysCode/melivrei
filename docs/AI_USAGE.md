# Registro de uso de IA — MeLivrei

Este documento registra os usos da IA como apoio ao planejamento, à documentação, à implementação e à validação do projeto MeLivrei.

## 1. Estruturação inicial da documentação do projeto

A IA auxiliou na elaboração do PRD, dos diagramas UML de casos de uso, classes e sequência, além dos diagramas C4 de contexto e containers, para registrar problema, escopo, atores, fluxos e arquitetura inicial do marketplace.

## 2. Atualização do nome do produto para MeLivrei

A IA apoiou a substituição da nomenclatura anterior “Brique Literário” por “MeLivrei” nos documentos arquiteturais e na definição do produto, mantendo a documentação coerente com a identidade escolhida pelo grupo.

## 3. Definição da arquitetura e da stack

A IA ajudou a registrar a decisão arquitetural do projeto, incluindo a organização em monorepo, frontend em Next.js, backend em NestJS, banco PostgreSQL, Prisma como ORM, Better Auth para autenticação e a integração inicial de pagamentos, posteriormente substituída pelo Mercado Pago (ver seção 17).

## 4. Criação da base do frontend e backend

A IA auxiliou na configuração inicial dos projetos frontend e backend, com dependências, scripts, estrutura de diretórios, testes e configurações de TypeScript necessárias para iniciar o desenvolvimento.

## 5. Adequação do backend ao uso de módulos ECMAScript

A IA apoiou a correção dos imports e das configurações do backend para compatibilidade com módulos ECMAScript, evitando erros de execução e de testes no ambiente Node.js.

## 6. Implementação da API de anúncios, vendas e trocas

A IA colaborou na construção da API para cadastrar e consultar anúncios, iniciar compras e propostas de troca, aceitar ou recusar negociações e registrar os estados do processo no banco de dados.

## 7. Modelagem do banco de dados com Prisma

A IA auxiliou na modelagem das entidades de usuários, livros, anúncios, imagens, negociações, propostas de troca, pagamentos, eventos de pagamento, auditoria e autenticação, incluindo relacionamentos e regras de integridade.

## 8. Integração inicial do fluxo de pagamentos

A IA apoiou a integração do backend com o provedor anterior para criar intenções de pagamento, tratar webhooks, impedir o reprocessamento de eventos e atualizar o status de pagamentos, anúncios e negociações.

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

## 17. Migração dos pagamentos do backend para Mercado Pago

A IA auxiliou a substituir a integração de pagamentos do backend por Mercado Pago Checkout Pro com OAuth de vendedores, tokens cifrados, split 1:1 configurável, preferências idempotentes, validação de webhooks e atualização persistida dos estados. A IA também apoiou a atualização da migração Prisma, da configuração e da documentação técnica, preservando o fluxo de trocas.

## 18. Ajuste da prévia do frontend

A IA removeu a faixa de demonstração, o seletor de perfis, os botões de reinício e os textos de teste das telas de acesso, compra e negociação. A prévia passou a apresentar a interface do produto com os dados fictícios ainda persistidos em `localStorage`.

## 19. Definição e implementação do checkout na prévia

A IA comparou a aprovação imediata com um checkout e recomendou manter a compra pendente até a confirmação do pagamento, conforme o PRD. Na prévia, adicionou uma página com livro, vendedor, total e escolha entre Pix e cartão de crédito. Os campos de cartão podem ser preenchidos sem persistir os dados informados; o Pix mostra a etapa pendente, sem emitir um código real. O pagamento por cartão na prévia registra uma aprovação local e retorna ao resumo. O fluxo real inicialmente preparado com Mercado Pago Checkout Pro foi posteriormente substituído pelo Payment Brick incorporado à plataforma.

## 20. Revisão da documentação do projeto

A IA revisou as referências ao provedor de pagamentos e atualizou os READMEs para descrever o checkout do Mercado Pago no backend e o checkout simulado no frontend. O roteiro da prévia passou a usar a navegação atual, incluindo o acesso por e-mail, o resumo da compra e a etapa de pagamento.

## 21. Integração do Payment Brick no checkout

A IA atualizou o checkout para exibir Pix e cartão de crédito na própria plataforma com o Payment Brick do Mercado Pago. O backend prepara a compra pendente, valida os dados recebidos, cria o pagamento com a comissão do marketplace usando a autorização OAuth do vendedor e devolve o QR Code e o código copia e cola do Pix. A aprovação depende do webhook validado. A interface real também passou a usar a API para catálogo, autenticação, publicação, compras e configuração da conta do vendedor.

## 22. Páginas legais e preparação do pitch

A IA auxiliou na criação das páginas de Termos de Uso, Política de Privacidade, Termos de serviço, Política de reembolso e Trocas e devoluções, contextualizadas para o marketplace de livros usados e trocas. Também preparou o fluxo local para gravação do pitch com capas ilustrativas originais, restauração dos dados iniciais pela conta, roteiro de gravação e ajustes de apresentação no checkout. Os campos locais de pagamento permanecem apenas na tela: não são enviados nem armazenados, e a aprovação do cartão altera somente o estado local da compra.
