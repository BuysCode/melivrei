# ADR-001 — Arquitetura web separada e stack do Brique Literário

- **Status:** Aceito
- **Data:** 2026-10-28
- **Decisores:** Carlos Felipe Diedrich, Gabriel Baum, Gabriel Tonon, Guilherme Duarte, Meri Ane Bronzoni Paim e Yuri Echevarria

## Contexto

O Brique Literário será um marketplace web com cadastro de usuários, anúncios, busca, negociações de venda, troca e empréstimo, pagamentos por Stripe, caução, multas, contestações e análise administrativa.

A solução precisa demonstrar orientação a objetos, separação de responsabilidades, testes, documentação de API, persistência relacional e execução com Docker Compose. O professor autorizou o uso de TypeScript, embora a orientação geral da atividade mencione Python ou Java.

## Decisão

Adotaremos uma arquitetura web separada, organizada em frontend, backend e banco de dados:

- **Frontend:** Next.js com React e TypeScript.
- **Backend:** NestJS com TypeScript.
- **Persistência:** PostgreSQL utilizando Prisma.
- **Pagamentos:** Stripe em ambiente de testes/sandbox.
- **Documentação:** Swagger/OpenAPI.
- **Testes:** Jest, testes unitários e testes de integração dos fluxos principais.
- **Execução:** Docker Compose.

O frontend será responsável pela interface e pela comunicação com a API. O backend concentrará autenticação, permissões, regras de negócio, transições de estado, integração com Stripe e validação de webhooks. O PostgreSQL será a fonte persistente dos dados do domínio.

## Alternativas consideradas

### Frontend e backend em uma única aplicação

Simplificaria a configuração inicial, mas dificultaria a demonstração clara da separação de responsabilidades e a documentação de uma API independente.

### Backend com Express sem NestJS

Seria mais enxuto, mas exigiria maior definição manual de módulos, injeção de dependências, validação e organização estrutural.

### Banco NoSQL

Poderia facilitar alterações de estrutura, mas o domínio possui relações fortes entre usuários, anúncios, negociações, pagamentos, empréstimos e auditoria. PostgreSQL se adequa melhor à integridade referencial necessária.

### Pagamento simulado internamente

Reduziria a complexidade, mas não demonstraria adequadamente o requisito de confirmação de pagamento por um provedor externo. O Stripe em sandbox oferece um fluxo mais realista sem movimentar dinheiro real.

## Consequências positivas

- Separação clara entre interface, regras de negócio e persistência.
- API documentável e testável de forma independente.
- Boa representação de orientação a objetos por meio de entidades, serviços e casos de uso.
- PostgreSQL fornece relacionamentos e integridade adequados ao domínio.
- Stripe permite validar pagamentos por webhook, reduzindo dependência de comprovantes manuais.
- Docker Compose facilita a execução padronizada pelo grupo e pela banca.

## Consequências negativas e riscos

- O grupo precisará configurar e integrar dois projetos de aplicação.
- A integração Stripe exige tratamento de webhook, idempotência e variáveis de ambiente.
- A arquitetura pode ficar grande para uma A3 se todos os fluxos forem implementados com a mesma profundidade.
- A equipe precisa controlar o escopo para não transformar o projeto em uma plataforma comercial completa.

## Medidas de controle

- Implementar primeiro o fluxo vertical de compra e, depois, o fluxo de empréstimo.
- Manter troca e administração com escopo mínimo e critérios claros.
- Utilizar apenas credenciais de teste do Stripe.
- Não armazenar dados completos de cartão.
- Registrar decisões novas em ADRs adicionais quando alterarem a arquitetura ou o comportamento do domínio.
