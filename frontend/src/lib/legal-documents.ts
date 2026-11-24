import type { LegalDocumentContent } from "@/components/legal-document";

export const legalDocuments: Record<string, LegalDocumentContent> = {
  "termos-de-uso": {
    title: "Termos de Uso",
    intro:
      "Estas regras explicam como utilizar o MeLivrei, marketplace que aproxima leitores para anunciar, comprar e trocar livros usados.",
    updatedAt: "23 de novembro de 2026",
    sections: [
      {
        title: "1. Sobre o MeLivrei",
        paragraphs: [
          "O MeLivrei oferece ferramentas para criar conta, publicar anúncios, pesquisar livros e registrar negociações de compra e troca. Os livros são anunciados por seus próprios usuários. O MeLivrei não é, por padrão, o vendedor, proprietário, editor ou expedidor dos livros anunciados.",
          "A plataforma registra os estados da negociação e, nas vendas habilitadas, integra o pagamento ao Mercado Pago. A combinação de entrega, retirada e demais detalhes da troca ou venda ocorre entre as pessoas envolvidas, fora da plataforma.",
        ],
      },
      {
        title: "2. Conta e elegibilidade",
        paragraphs: [
          "Você deve fornecer dados corretos, manter sua senha em sigilo e usar apenas sua própria conta. Avise o MeLivrei se suspeitar de acesso não autorizado. Atividades realizadas com sua sessão podem ser associadas à sua conta, ressalvada a apuração de uso indevido.",
          "Ao usar a plataforma, você declara ter capacidade para aceitar estes termos. Menores de idade devem utilizar o serviço com a assistência e autorização de seu responsável legal, observada a legislação aplicável.",
        ],
      },
      {
        title: "3. Anúncios e conteúdo",
        paragraphs: [
          "Quem anuncia deve ter legitimidade para oferecer o livro e informar, com clareza, título, autor, estado de conservação, modalidade, preço quando houver, descrição e imagens fiéis ao exemplar. O anunciante é responsável pela exatidão das informações e por manter disponibilidade e preço atualizados.",
        ],
        items: [
          "Não publique conteúdo ilegal, enganoso, discriminatório, ofensivo ou que viole direitos de terceiros.",
          "Não anuncie item que você não possa entregar ou oferecer legitimamente; não use o catálogo para spam, fraude ou coleta indevida de dados.",
          "Você autoriza o MeLivrei a exibir o conteúdo do anúncio dentro da plataforma para operar e divulgar o catálogo, sem transferir a titularidade do conteúdo.",
        ],
      },
      {
        title: "4. Compras, trocas e pagamentos",
        paragraphs: [
          "Uma proposta de compra ou troca não garante aceitação nem reserva definitiva até que o sistema indique o estado correspondente. Nas vendas integradas, o pagamento deve ser feito pelo checkout disponibilizado. O estado de pagamento é atualizado após confirmação processada pelo backend com o Mercado Pago; comprovante enviado por mensagem não substitui essa confirmação.",
          "O MeLivrei não armazena os dados completos do cartão. O processamento é realizado pelo Mercado Pago, conforme os termos e avisos de privacidade do provedor. A disponibilidade de meios de pagamento, repasses, comissões e funcionalidades depende da configuração e aprovação do provedor.",
          "Antes de concluir, comprador e anunciante devem combinar entrega ou retirada, prazos e condições. Não compartilhe senhas, códigos de autenticação ou dados de cartão em mensagens.",
        ],
      },
      {
        title: "5. Condutas e moderação",
        paragraphs: [
          "É proibido contornar controles de segurança, interferir no funcionamento do serviço, tentar acessar contas ou dados alheios, manipular pagamentos ou usar o MeLivrei para prática ilícita. Podemos ocultar conteúdo, suspender funcionalidades ou restringir contas quando necessário para investigar abuso, cumprir a lei ou proteger usuários, considerando a gravidade e as informações disponíveis.",
        ],
      },
      {
        title: "6. Disponibilidade e responsabilidade",
        paragraphs: [
          "Trabalhamos para manter o serviço disponível e seguro, mas podem ocorrer indisponibilidades, manutenção ou falhas de terceiros. A plataforma não garante a venda, a aceitação de uma proposta, a condição do exemplar nem o cumprimento de obrigações assumidas diretamente entre usuários.",
          "Nada nestes termos exclui direitos previstos em lei ou limita responsabilidades que não possam ser afastadas. Em relações de consumo, aplicam-se as normas obrigatórias pertinentes; cada caso depende da natureza da relação e dos fatos concretos.",
        ],
      },
      {
        title: "7. Encerramento e alterações",
        paragraphs: [
          "Você pode deixar de usar o serviço e solicitar o encerramento da conta pelo canal de atendimento divulgado pelo MeLivrei, respeitadas retenções legalmente necessárias e negociações em andamento. Podemos atualizar estes termos para refletir mudanças no produto ou na lei. Indicaremos a nova data de versão e, quando a mudança for relevante, comunicaremos os usuários por meio adequado.",
        ],
      },
      {
        title: "8. Legislação e contato",
        paragraphs: [
          "Estes termos são regidos pelas leis brasileiras. Eventuais controvérsias serão submetidas ao foro competente, preservadas as regras legais de competência e os direitos do consumidor.",
          "Para dúvidas sobre estes termos, use o canal oficial de atendimento informado no site ou na sua conta.",
        ],
      },
    ],
  },
  "politica-de-privacidade": {
    title: "Política de Privacidade",
    intro:
      "Explicamos quais dados o MeLivrei usa para manter contas, anúncios, negociações e pagamentos, e como você pode exercer seus direitos de privacidade.",
    updatedAt: "23 de novembro de 2026",
    sections: [
      {
        title: "1. Quem trata seus dados",
        paragraphs: [
          "Controlador: [inserir razão social ou nome completo do responsável pelo MeLivrei], [CNPJ/CPF e endereço comercial, conforme aplicável]. Canal de privacidade e atendimento: [inserir e-mail ou formulário oficial]. Esses dados de identificação e contato precisam ser preenchidos pelo responsável antes da publicação definitiva desta política.",
          "O MeLivrei decide por que e como os dados são usados para operar o marketplace. Fornecedores de infraestrutura e serviços podem tratar dados em nosso nome, conforme instruções e contratos aplicáveis. O Mercado Pago trata dados necessários ao pagamento de acordo com seus próprios termos e papéis legais.",
        ],
      },
      {
        title: "2. Dados tratados e finalidades",
        paragraphs: [
          "Tratamos somente dados relacionados à operação e à segurança do serviço, conforme o recurso utilizado:",
        ],
        items: [
          "Cadastro e acesso: nome, e-mail, credenciais protegidas por hash e informações técnicas de sessão, para criar conta, autenticar e proteger o acesso.",
          "Anúncios: dados do livro, descrição, imagens e identificador do anunciante, para exibir e administrar o catálogo.",
          "Negociações: participantes, anúncios envolvidos, propostas, estados e histórico de eventos, para registrar e acompanhar compra ou troca.",
          "Pagamentos: identificadores e metadados necessários para acompanhar a transação e confirmar seu estado; o MeLivrei não armazena o número completo nem o código de segurança do cartão.",
          "Conta de recebimento do anunciante: dados e tokens de autorização Mercado Pago necessários à integração. Tokens são tratados com proteção técnica, incluindo cifragem quando armazenados pelo serviço.",
        ],
      },
      {
        title: "3. Bases legais",
        paragraphs: [
          "Conforme a finalidade concreta, o tratamento pode se apoiar na execução de contrato ou de procedimentos solicitados por você, no cumprimento de obrigações legais e regulatórias, no exercício regular de direitos ou em legítimo interesse avaliado com respeito aos seus direitos e expectativas. Quando uma finalidade depender de consentimento, ele será solicitado de forma específica e poderá ser revogado, sem afetar tratamentos anteriores legítimos.",
        ],
      },
      {
        title: "4. Compartilhamento",
        paragraphs: [
          "Compartilhamos dados apenas quando necessário para as finalidades descritas. O Mercado Pago recebe dados necessários para processar ou confirmar pagamentos e para a conexão autorizada da conta do vendedor. Para viabilizar uma negociação, informações do anúncio e dados de contato estritamente necessários podem ser apresentados à outra parte; combine entrega ou retirada sem divulgar dados excessivos.",
          "Provedores que hospedam, armazenam, autenticam ou mantêm o serviço podem tratar dados sob instruções do MeLivrei. Também poderemos divulgar informações quando exigido por lei, por ordem válida ou para proteger direitos e segurança. Não vendemos dados pessoais.",
        ],
      },
      {
        title: "5. Retenção e segurança",
        paragraphs: [
          "Mantemos os dados pelo tempo necessário para fornecer o serviço, manter o histórico de negociações e cumprir obrigações legais, regulatórias ou de defesa de direitos. Quando a finalidade termina, eliminamos ou anonimizamos os dados quando possível, ressalvadas hipóteses legais de conservação.",
          "Adotamos medidas técnicas e administrativas compatíveis com a natureza dos dados e os riscos do tratamento, como proteção de credenciais e controles de acesso. Nenhum sistema conectado à internet pode garantir segurança absoluta. Se houver incidente relevante, serão adotadas as medidas e comunicações exigidas pela legislação.",
        ],
      },
      {
        title: "6. Seus direitos",
        paragraphs: [
          "Você pode solicitar confirmação do tratamento, acesso, correção, anonimização, bloqueio ou eliminação quando cabível, portabilidade nos termos da regulamentação, informação sobre compartilhamentos, revisão de decisões automatizadas quando aplicável, oposição a tratamento irregular e revogação de consentimento. Alguns dados precisam ser mantidos para cumprir dever legal ou exercer direitos.",
          "Envie seu pedido ao canal oficial de privacidade indicado na seção 1. Podemos solicitar informações proporcionais para confirmar sua identidade e proteger seus dados. Os pedidos são gratuitos e serão atendidos nos prazos legais aplicáveis. Se entender que seus direitos não foram respeitados, você pode apresentar petição à ANPD ou procurar os órgãos competentes.",
        ],
      },
      {
        title: "7. Cookies, sessão e crianças",
        paragraphs: [
          "O serviço usa armazenamento técnico necessário para manter a sessão e funcionalidades solicitadas. O projeto não descreve uso de cookies publicitários ou rastreadores de terceiros; se recursos de análise ou publicidade forem adicionados, esta política e os controles de consentimento serão atualizados antes de seu uso.",
          "O marketplace não é direcionado a crianças. Menores devem utilizar a plataforma com orientação de responsável legal. Se identificarmos tratamento irregular de dados de criança ou adolescente, adotaremos as medidas cabíveis conforme a legislação.",
        ],
      },
      {
        title: "8. Atualizações",
        paragraphs: [
          "Esta política pode mudar quando o serviço, seus fornecedores ou a legislação mudar. A versão e a data de atualização serão publicadas nesta página. Consulte-a periodicamente.",
        ],
      },
    ],
  },
  "termos-de-servico": {
    title: "Termos de serviço",
    intro:
      "Condições operacionais para usar os recursos de catálogo, anúncios, negociação e pagamento do MeLivrei.",
    updatedAt: "23 de novembro de 2026",
    sections: [
      {
        title: "1. Serviço oferecido",
        paragraphs: [
          "O MeLivrei disponibiliza uma plataforma digital de intermediação de contato para livros usados. Usuários podem consultar anúncios, criar anúncios de venda ou troca, enviar propostas e acompanhar o histórico. A operação física da entrega ou retirada é combinada diretamente entre vendedor e comprador ou entre as partes da troca.",
          "Nas vendas habilitadas, o checkout integra o Mercado Pago. O MeLivrei registra dados de referência e atualiza o estado da negociação depois de confirmação verificada pelo backend. A plataforma não aceita comprovantes manuais como confirmação de pagamento.",
        ],
      },
      {
        title: "2. Deveres de quem anuncia",
        paragraphs: [
          "O anunciante deve informar fielmente a condição do livro, responder às propostas, atualizar a disponibilidade e honrar o preço e as condições que aceitou, observado o direito aplicável. O anunciante é responsável por embalar e entregar o exemplar conforme combinado, salvo ajuste diverso entre as partes.",
        ],
      },
      {
        title: "3. Deveres de quem compra ou propõe troca",
        paragraphs: [
          "Antes de confirmar uma negociação, confira descrição, imagens, condição, preço e modalidade. Combine por escrito os detalhes de entrega ou retirada e guarde os registros relevantes. Em uma troca, cada parte deve descrever corretamente o livro oferecido e cumprir o que foi aceito.",
        ],
      },
      {
        title: "4. Pagamentos",
        paragraphs: [
          "O Mercado Pago processa os pagamentos e pode aplicar suas próprias regras de análise, disponibilidade, tarifas, estornos e prazos. Uma cobrança só será considerada aprovada no MeLivrei quando o backend confirmar o estado recebido e validado junto ao provedor. Se houver recusa, expiração ou divergência, siga as informações exibidas e procure o atendimento oficial.",
          "Não envie dados completos de cartão, senha ou código de segurança ao anunciante ou ao suporte. O MeLivrei não promete repasse, split ou comissão específicos quando a configuração do provedor não os disponibilizar.",
        ],
      },
      {
        title: "5. Entrega, retirada e problemas na negociação",
        paragraphs: [
          "O MeLivrei não realiza transporte, guarda ou inspeção física dos livros. As partes devem definir local, prazo, custo de envio e forma de comprovação da entrega. Se houver atraso, dano, item diferente do anúncio ou desistência, as partes devem tentar resolver diretamente e podem usar os canais de atendimento disponíveis para relatar o ocorrido.",
          "Essa divisão operacional não elimina responsabilidades previstas em lei. Se a relação for de consumo, os direitos obrigatórios do consumidor continuam aplicáveis, ainda que a negociação tenha ocorrido entre usuários.",
        ],
      },
      {
        title: "6. Suporte e disponibilidade",
        paragraphs: [
          "O suporte poderá orientar sobre acesso, funcionamento, estados registrados e integração de pagamento. Não podemos alterar por conta própria um estado de pagamento sem confirmação do provedor nem garantir o resultado de uma disputa entre usuários.",
          "Recursos podem ser alterados ou ficar temporariamente indisponíveis para manutenção, segurança ou atualização. Quando possível, informaremos mudanças relevantes na plataforma.",
        ],
      },
      {
        title: "7. Relação com os Termos de Uso",
        paragraphs: [
          "Estes termos complementam os Termos de Uso e a Política de Privacidade. Em caso de divergência, prevalecem as normas legais obrigatórias e, entre os documentos do MeLivrei, a regra mais específica para o assunto tratado.",
        ],
      },
    ],
  },
  "politica-de-reembolso": {
    title: "Política de reembolso",
    intro:
      "Como solicitar e acompanhar a devolução de valores de uma compra de livro feita pelo checkout do MeLivrei.",
    updatedAt: "23 de novembro de 2026",
    sections: [
      {
        title: "1. A quem se aplica",
        paragraphs: [
          "Esta política explica o fluxo operacional de reembolso para pagamentos processados pelo Mercado Pago em compras de livros no MeLivrei. Ela não elimina nem reduz direitos previstos no Código de Defesa do Consumidor ou em outras normas obrigatórias. A aplicação desses direitos depende da natureza da relação e das circunstâncias da compra; uma negociação entre particulares não é automaticamente uma relação de consumo, nem pode ser presumida como exceção em todos os casos.",
        ],
      },
      {
        title: "2. Como pedir ajuda",
        paragraphs: [
          "Se a compra foi cancelada, cobrada em duplicidade, não reconhecida, ou se você acredita ter direito a reembolso, registre o pedido pelo canal oficial de atendimento do MeLivrei e informe o identificador da negociação ou do pagamento, a data e o motivo. Não inclua número completo de cartão nem código de segurança. Para problemas de entrega ou condição do livro, descreva o ocorrido e anexe apenas evidências necessárias, evitando dados de terceiros.",
          "O MeLivrei verificará o estado registrado e, quando necessário, orientará o contato com o vendedor ou com o Mercado Pago. O recebimento do pedido não significa aprovação automática. A decisão será comunicada após análise dos fatos, das regras aplicáveis e do estado do pagamento.",
        ],
      },
      {
        title: "3. Processamento do valor",
        paragraphs: [
          "Quando o reembolso for cabível e autorizado no fluxo aplicável, o estorno é solicitado ao Mercado Pago ou processado conforme o arranjo de pagamento. O prazo para o valor aparecer depende do meio utilizado e dos procedimentos do provedor ou emissor. Consulte o próprio Mercado Pago ou a instituição financeira para obter a previsão específica da transação.",
          "O MeLivrei não realiza reembolso de pagamento que não conste como aprovado no sistema. Em caso de Pix pendente, pagamento recusado ou expirado, confirme primeiro com o provedor se houve débito. Não fazemos pagamentos de reembolso por fora da transação original sem verificação adequada.",
        ],
      },
      {
        title: "4. Desistência e cancelamento",
        paragraphs: [
          "Se desejar cancelar antes da conclusão, contate o anunciante e o MeLivrei prontamente. Em compras realizadas fora de estabelecimento comercial, o direito de arrependimento previsto em lei poderá ser aplicável conforme a relação concreta; quando aplicável, o prazo legal é contado nos termos da legislação e a restituição deve observar as regras legais. Esta política não exige que o consumidor renuncie a esse direito.",
          "Cancelamentos por recusa ou expiração de pagamento seguem o estado informado pelo Mercado Pago. O anúncio poderá voltar a ficar disponível conforme o estado da negociação.",
        ],
      },
      {
        title: "5. Compra de usuário para usuário",
        paragraphs: [
          "Em compra entre usuários, o vendedor e o comprador são responsáveis por tratar diretamente de questões sobre envio, retirada e estado do exemplar, sem prejuízo da atuação do MeLivrei nos limites de suas ferramentas e das responsabilidades que a lei eventualmente atribua à plataforma ou às partes.",
          "Não prometemos cobertura, prazo fixo de análise ou reembolso automático para toda disputa. A ausência de um procedimento específico no sistema não impede que você exerça direitos previstos em lei perante o responsável adequado ou os órgãos competentes.",
        ],
      },
      {
        title: "6. Informações de contato",
        paragraphs: [
          "Use o canal oficial de atendimento indicado no site ou na sua conta. Inclua apenas os dados necessários para localizar a negociação. Para dúvidas sobre uma cobrança processada, você também pode consultar o suporte do Mercado Pago.",
        ],
      },
    ],
  },
  "trocas-e-devolucoes": {
    title: "Trocas e devoluções",
    intro:
      "Regras práticas para trocas de livros entre usuários e para devoluções ligadas a uma compra, respeitando os direitos previstos em lei.",
    updatedAt: "23 de novembro de 2026",
    sections: [
      {
        title: "1. Troca de livros entre usuários",
        paragraphs: [
          "No MeLivrei, a troca começa com uma proposta que identifica o livro desejado e o livro oferecido. O proprietário do anúncio pode aceitar ou recusar. A proposta só se torna acordo quando o sistema indica o aceite; depois disso, as partes devem combinar como e quando farão a entrega ou retirada.",
          "Antes de aceitar, confira a descrição e a condição de ambos os livros. Registre por mensagem as condições combinadas. Cada participante deve entregar o exemplar anunciado, informar defeitos relevantes e avisar prontamente se não puder cumprir o combinado.",
        ],
      },
      {
        title: "2. Cancelar uma troca",
        paragraphs: [
          "Se a troca ainda não foi concluída, informe a outra parte e use a opção de cancelamento disponível, quando houver. O estado dos anúncios poderá ser atualizado para permitir novas propostas. Se os livros já foram entregues, a devolução precisa ser acordada entre as partes, salvo quando a legislação aplicável estabelecer obrigação diferente.",
        ],
      },
      {
        title: "3. Devoluções de compras",
        paragraphs: [
          "Para uma compra, entre em contato com o vendedor e com o atendimento do MeLivrei assim que identificar atraso, divergência relevante em relação ao anúncio, dano ou outro problema. Informe o número da negociação, descreva o que ocorreu e guarde registros do anúncio e da entrega.",
          "Quando o Código de Defesa do Consumidor ou outra norma reconhecer direito de arrependimento, troca, reparação ou restituição, esse direito permanece válido conforme seus requisitos e prazos. Não é possível definir um único prazo ou solução para todos os casos de venda entre usuários, pois isso depende de quem vende, de como a oferta foi feita e dos fatos da negociação.",
        ],
      },
      {
        title: "4. Envio e estado do livro",
        paragraphs: [
          "O MeLivrei não organiza nem executa a entrega física. Comprador e vendedor devem acordar modalidade, custo, prazo, embalagem e endereço diretamente, compartilhando somente as informações necessárias. Ao receber, confira o livro e comunique qualquer divergência sem demora.",
        ],
      },
      {
        title: "5. Pagamento e devolução do valor",
        paragraphs: [
          "Se uma compra paga pelo checkout precisar ser cancelada ou reembolsada, consulte também a Política de reembolso. Os valores retornam pelo fluxo do Mercado Pago ou do meio de pagamento original, e o tempo de processamento pode variar conforme o provedor e o emissor.",
        ],
      },
      {
        title: "6. Como relatar um problema",
        paragraphs: [
          "Use o canal oficial de atendimento divulgado pelo MeLivrei e informe o identificador da negociação, o que foi combinado e o que aconteceu. Não envie documentos ou dados pessoais de terceiros que não sejam necessários. O MeLivrei pode orientar e verificar o histórico registrado, mas a resolução de entrega e devolução física depende das partes, salvo obrigações legais aplicáveis.",
        ],
      },
    ],
  },
};
