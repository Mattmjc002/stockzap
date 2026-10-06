# StockZap · Demonstração completa

Versão de apresentação do aplicativo, com a identidade visual da StockZap, front-end responsivo e um servidor Node.js sem dependências externas. A empresa, as pessoas e os registros iniciais são fictícios.

## Começar

Use **Node.js 24**. Abra o terminal na pasta que contém este `package.json` e execute:

```powershell
npm.cmd start
```

No macOS/Linux ou em outro terminal, `npm start` faz a mesma coisa. Não é necessário rodar `npm install`, pois o projeto não depende de pacotes externos.

Abra **http://localhost:3000**, clique em **Entrar** na página inicial e depois em **Entrar** na tela de login. Não preencha e-mail ou senha: o formulário demonstrativo não envia esses campos.

No Windows, você também pode abrir `Iniciar_Windows.bat`, que inicia o servidor e abre a apresentação no navegador.

Para uma apresentação rápida sem servidor, abra `index.html` na raiz do projeto. Esse caminho usa armazenamento no navegador e consultas locais do ZapCare. O modo com servidor é recomendado para demonstrar o back-end e conectar a IA generativa. Os dados do navegador e os dados do servidor são independentes.

## O que está pronto

- Landing page e entrada direta na empresa fictícia.
- Visão geral com indicadores calculados, gráfico diário, ranking, meta e alertas.
- Produtos: cadastro, edição, arquivamento, filtros, ordenação e exportação CSV.
- Estoque: posição atual, reposição sugerida, movimentações, fornecedores e geração opcional de conta por compra.
- Pedidos: clientes, criação com vários itens, preparo, entrega, pagamento e cancelamento.
- Financeiro: receitas, despesas, baixas, contas em aberto, caixa, resultado estimado e exportação.
- Prazos: cadastro, edição, responsáveis, prioridades, conclusão e reabertura.
- Equipe: cadastro, edição, áreas, contatos e status.
- WhatsApp: conversas demonstrativas e registro de mensagens dentro do aplicativo.
- Configurações: empresa, meta, tema claro/escuro/sistema, exportação completa e restauração da demonstração.
- Busca geral, notificações, telas vazias, mensagens de erro, página 404 e navegação no celular.
- ZapCare flutuante, expansão para a página completa, histórico, cópia de respostas e links para os módulos consultados.
- Painel da equipe StockZap: empresas clientes, fila por prioridade, risco explicável, responsáveis, retornos, histórico e solicitações do chat.

## Painel de atendimento da StockZap

Na landing page, clique em **Equipe StockZap**. Dentro da empresa demonstrativa, use **Equipe StockZap → Atendimentos** no menu. O endereço da tela é `public/app.html#atendimentos` na hospedagem estática e `http://localhost:3000/app.html#atendimentos` no servidor local. O atalho `public/atendimentos.html` também abre o painel.

O painel acompanha **10 empresas fictícias clientes da StockZap**, com 8 atendimentos iniciais (7 abertos e 1 resolvido). Esses clientes do aplicativo são distintos dos compradores e dos colaboradores do Empório Aurora. Os indicadores são calculados a partir dos registros.

- Fila ordenada por prioridade e filtros por empresa/gestor/assunto, situação, risco, jornada e responsável.
- Detalhes por empresa com atividade recente, comparação de duas janelas de 7 dias, motivo do risco e sugestão de próxima ação.
- Jornadas de onboarding, engajamento e reativação. Sem eventos disponíveis, o risco aparece como **Sem dados**.
- Criação de atendimento, atribuição a Matheus Milagres, Cauê Mathias ou Manuela Valone, definição de retorno, conclusão e reabertura.
- Registro de notas, contatos e respostas simulados, com histórico por empresa e exportação CSV da fila filtrada.
- Botão **Solicitar atendimento da StockZap** no ZapCare do cliente. A solicitação do Empório Aurora aparece no painel da equipe.
- Operações como venda, movimentação de estoque e baixa financeira geram eventos de uso vinculados ao Empório Aurora.

**Critérios iniciais do MVP:** risco alto após 7 dias sem atividade com histórico disponível (80 pontos); médio após queda de ao menos 50% entre dois períodos de 7 dias, com pelo menos 3 atividades no período anterior (55); baixo quando os critérios não são atingidos (10). Na fila, somam-se até 30 pontos pela prioridade do caso, 15 por retorno vencido e 10 durante os primeiros 7 dias de uso. O máximo é 100. A falta de eventos usa 25 pontos apenas para ordenar a investigação da coleta, sem confirmar risco de abandono. A janela e os limites precisam de validação por segmento. O botão **Como a prioridade funciona?** explica as regras na interface.

Os canais de WhatsApp, e-mail e telefone **não enviam mensagens externas**. O painel registra a simulação revisada pela equipe. Contatos pausados e um contato já simulado na data bloqueiam repetição; notas internas continuam disponíveis. A data de referência permanece em 30/09/2026; para repetir o cenário inicial, use a restauração da demonstração.

Os dados ficam no navegador quando a demo está hospedada como arquivos estáticos na Vercel. Com `server.cjs`, as alterações usam a API existente e são persistidas no JSON do servidor. Bases antigas recebem os dados do painel uma única vez, sem apagar pedidos, produtos ou lançamentos já cadastrados. A demonstração mantém entrada sem senha; o painel também é demonstrativo.

O contexto enviado à IA do cliente contém apenas os dados do seu negócio. As outras empresas e os registros internos do painel não são incluídos na requisição ao modelo.

Para publicar no projeto Vercel existente, substitua a pasta `demo/` pelos arquivos atualizados, faça commit e push na branch de produção (por exemplo, `main`). A rota `/demo/index.html` continua abrindo a landing page. Com essa estrutura, o acesso direto ao painel é `/demo/public/app.html#atendimentos`. O servidor Node não é iniciado automaticamente pela hospedagem estática; a demo usa o modo de navegador nesse endereço.

## Empresa fictícia

**Empório Aurora**, pequeno comércio na Asa Norte, Brasília. São 18 produtos, 4 fornecedores, 10 clientes, 5 colaboradores, 146 pedidos de agosto e setembro, contas, prazos e conversas já cadastrados.

A referência é **30/09/2026**. A data é fixa para a apresentação não mudar de comportamento no dia seguinte. Os indicadores e alertas usam essa referência.

Os movimentos históricos reconciliam com o saldo atual. Os produtos têm custos, preços, estoque mínimo e estoque ideal. Os pedidos guardam preços e custos históricos: editar o cadastro não muda as vendas anteriores.

O cenário contém problemas para explorar: quatro produtos no mínimo ou abaixo, um esgotado, contas em aberto e resultado estimado negativo. Esses resultados vêm dos registros; não são cartões com números independentes.

## Operações conectadas

Criar um pedido valida a disponibilidade, baixa o estoque e cria a receita. Confirmar o pagamento sincroniza o pedido e o financeiro. Cancelar devolve os itens uma única vez e cancela a receita na demonstração. Não há pagamento real.

Movimentar uma entrada pode criar uma conta a pagar pelo custo unitário. Baixar uma conta antiga registra o recebimento ou pagamento na data de referência, sem deslocá-lo para o mês de competência da conta.

Vendas são o total de pedidos não cancelados. Caixa usa apenas pagamentos registrados. Resultado estimado é vendas menos os custos gravados nos pedidos e as despesas operacionais lançadas. Compras de estoque afetam caixa, sem duplicar o custo das mercadorias nesse resultado. O indicador não substitui uma demonstração contábil completa.

## ZapCare: dois modos

### Sem chave: consultas locais

Funciona imediatamente, inclusive sem internet. O motor local consulta os registros atuais e calcula respostas sobre estoque, produtos, preços, custos, margens, pedidos, clientes, equipe, fornecedores, metas, vendas, caixa, contas e prazos. Aceita referências como hoje, ontem, últimos 7 dias, agosto e datas no formato AAAA-MM-DD.

É um motor de consultas e regras, **não um modelo generativo executado localmente**. Não interpreta qualquer pergunta arbitrária. Quando a consulta não é reconhecida ou não há dados, ele informa isso. Perguntas sobre períodos futuros não são apresentadas como resultados realizados.

Exemplos:

- O que preciso repor?
- Qual o estoque do CAF-001?
- Qual meu lucro em setembro?
- Como estão minhas vendas nos últimos 7 dias?
- Quais contas preciso pagar?
- Quais são os produtos mais vendidos?
- Quem trabalha na empresa?
- Como está meu negócio e o que devo priorizar?
- O que aconteceu no pedido #1146?

Cadastre uma venda ou movimente o estoque e faça a pergunta novamente: a resposta usa o estado atualizado.

### Com chave: IA generativa

A integração com a **OpenAI Responses API** está implementada no servidor. Copie `.env.example` para `.env` e configure:

```dotenv
OPENAI_API_KEY=sua_chave
OPENAI_MODEL=gpt-6-astra
```

Você pode escolher outro modelo compatível com a Responses API disponível na sua conta. A opção de raciocínio baixo é enviada para modelos das famílias GPT-5/GPT-6.

Reinicie o servidor. O status do ZapCare passa a indicar IA conectada. A cada pergunta, o servidor fornece a base atual da empresa e o histórico recente ao modelo. A chave fica no servidor e não é enviada ao navegador. Se o provedor falhar, o aplicativo identifica a falha e usa a consulta local.

Esse modo exige internet, uma chave válida e acesso/créditos na API. A integração foi verificada com respostas simuladas; não foi feita uma chamada paga real. Documentação oficial: https://developers.openai.com/api/docs/guides/text

## Dados e comandos

Com servidor, as alterações são gravadas em `data/aurora.json`, criado automaticamente no primeiro início. As escritas são atômicas e usam uma revisão para impedir que uma aba sobrescreva silenciosamente outra.

No modo sem servidor, os dados ficam no armazenamento do navegador. As preferências de tema e o histórico do chat também ficam no navegador.

```powershell
npm.cmd test
npm.cmd run backup
```

O backup copia o arquivo de dados do servidor para `backups/` com data e hora no nome. Também é possível exportar todos os dados em Configurações → Demonstração.

Para voltar ao cenário original: Configurações → Demonstração → Restaurar. A restauração pede confirmação e limpa o histórico do ZapCare nesse navegador. Na execução com servidor, ela restaura a base compartilhada por todas as abas.

## Estrutura

```text
StockZap_Demo/
  public/              Interface, estilos, imagens e regras compartilhadas
  server.cjs           Servidor HTTP e API
  scripts/             Inicialização assistida e backup
  tests/               Testes das regras e do servidor
  docs/                Documentos originais de planejamento
  .env.example         Configuração opcional
  package.json         Comandos do projeto
  index.html           Entrada rápida sem servidor
```

Os documentos em `docs/` foram preservados como planejamento histórico; este README descreve a implementação atual. Os endereços HTML antigos redirecionam para as telas novas. O código entregue não depende do Supabase.

Para hospedagem estática, publique o conteúdo de `public/`. A demonstração continua no modo de navegador. Para usar a API e a IA generativa, execute `server.cjs` em um ambiente Node.js 24.

Esta entrega é o ambiente solicitado para apresentação: entrada sem autenticação, uma única empresa fictícia e WhatsApp simulado. O cadastro da equipe organiza pessoas; não cria contas individuais.
