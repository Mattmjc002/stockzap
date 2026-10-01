# Validação da entrega

Referência: 30/09/2026. Execução em Node.js 24.

## Testes automatizados — 14 aprovados

O comando `npm test` verifica totais, atualização de estoque e financeiro, preços históricos, cancelamento único, rejeição de estoque insuficiente, contas de reposição, sincronização de pagamento, validações, períodos, respostas locais com dados atualizados, conciliação das movimentações, data de baixa e API com revisão de dados.

A chamada generativa foi testada com um provedor simulado: envio do contexto atual, leitura de saída textual após itens de raciocínio e fallback identificado em caso de falha. Os testes não usam a chave real de um `.env` e não fazem chamadas pagas.

## Navegador — 16 fluxos concluídos

1. Venda pelo formulário com atualização do pedido, estoque e receita.
2. Pergunta ao ZapCare após a venda, com a nova quantidade.
3. Cadastro de produto com caracteres especiais escapados.
4. Busca e edição do catálogo.
5. Reposição pelo formulário com geração de conta a pagar.
6. Preparo, entrega e cancelamento com devolução de estoque.
7. Lançamento financeiro pago.
8. Cadastro e conclusão de prazo.
9. Cadastro da equipe.
10. Atualização do perfil da empresa nas telas.
11. Registro de mensagem na conversa demonstrativa.
12. Busca global com navegação ao produto.
13. Exportação CSV.
14. Restauração da demonstração.
15. Abertura local sem servidor.
16. Menu e catálogo no celular.

As telas foram verificadas em computador e celular, em tema claro e escuro. Não foram encontrados erros de JavaScript nos fluxos verificados nem transbordamento horizontal da página nas larguras verificadas. Tabelas podem ser roladas horizontalmente dentro de seus próprios cartões.

## Limites da demonstração

Não foi feita chamada real à OpenAI com uma chave paga, nem envio real pelo WhatsApp. A entrada é deliberadamente sem autenticação. A revisão não é uma certificação para uso em produção.
