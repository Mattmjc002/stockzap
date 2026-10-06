# Validação do painel de atendimento

Versão 1.1.0, implementação de 06/10/2026. A referência dos dados da demonstração é 30/09/2026.

## Verificações concluídas

`node --test tests/*.test.cjs`: **27 testes aprovados**. Incluem as regras anteriores de estoque, pedidos, financeiro e ZapCare e as novas verificações:

- Indicadores calculados a partir dos atendimentos e das empresas clientes.
- Janelas de engajamento, limite de inatividade e queda de uso.
- Ausência de eventos, onboarding e exclusão de eventos futuros.
- Filtros por empresa, risco, responsável ausente e situação.
- Migração de bases antigas sem apagar os dados do negócio.
- Solicitação do chat vinculada à empresa atual.
- Atribuição, conclusão, reabertura, retorno e histórico.
- Rejeição de responsáveis inválidos, datas impossíveis e casos de outra empresa.
- Contatos simulados, pausas e bloqueio de repetição na mesma data.
- Captura de uso vinculada ao Empório Aurora.
- Persistência pela API e rejeição de revisão antiga.
- Exclusão das outras empresas e dos atendimentos internos do contexto enviado à IA do cliente.

Também foram verificados a sintaxe JavaScript, os arquivos referenciados pelo HTML, a geração do template do painel com filtros e fila vazia, IDs únicos e o escape de texto inserido no histórico.

## Limite da verificação visual

A inspeção visual no navegador e os testes completos por cliques não puderam ser concluídos: o navegador disponível bloqueou tanto a execução local HTTP quanto a abertura de arquivos locais. Nenhuma validação visual em celular ou computador foi declarada como realizada.

## Roteiro para conferir no seu navegador

1. Abra a demo e clique em **Equipe StockZap**. A base inicial deve mostrar 7 atendimentos abertos, 2 empresas em risco alto, 2 retornos vencidos e 1 caso concluído nos últimos 7 dias.
2. Filtre por **Sem responsável**: Padaria Horizonte e Oficina Tech devem aparecer. Filtre por **Sem dados**: Oficina Tech deve aparecer sem atribuição de risco alto.
3. Selecione a Padaria e clique em **Assumir**. O caso passa a **Em atendimento**, com Matheus Milagres como responsável.
4. Atualize o caso para **Resolvido**, registrando o resultado. Ele sai do filtro **Em aberto**. Use **Resolvido**, selecione a empresa e reabra o caso.
5. Crie um atendimento e confira a inclusão no histórico. Recarregue a página: a alteração deve permanecer no mesmo modo de armazenamento.
6. Registre um contato simulado com o Café do Cerrado. Uma segunda abordagem na mesma data deve ficar bloqueada; uma nota interna continua disponível.
7. Abra o ZapCare no Empório Aurora e use **Solicitar atendimento da StockZap**. A solicitação deve aparecer no painel da equipe, vinculada ao Empório.
8. Exporte a fila e confira o CSV. Teste busca sem resultado e limpeza de filtros.
9. Confira a organização em tela estreita, o menu móvel, a rolagem da tabela, os formulários e os temas claro/escuro.

WhatsApp/e-mail/telefone permanecem simulados. Na Vercel estática, a persistência é por navegador; no servidor Node, a base é compartilhada pela API da demonstração.
