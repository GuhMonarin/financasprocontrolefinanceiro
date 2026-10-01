# Controle de despesas pagas e pendentes

## Resultado
- Cada despesa terá o status **A pagar** ou **Pago**.
- As despesas já cadastradas começarão como **A pagar**.
- Novas despesas também começarão como **A pagar**.
- Na tela de Transações, o mês selecionado mostrará três totais: **Despesas do mês**, **Pago** e **Falta pagar**.
- Cada despesa poderá ser marcada como paga ou voltar para “A pagar” diretamente na lista.
- O status será apenas pago/pendente, sem registrar data de pagamento.

## Detalhes técnicos
- Adicionar à transação um campo booleano de pagamento com padrão falso, preservando os registros existentes.
- Atualizar leituras, tipos e alterações de transação para manter os totais e a lista sincronizados.
- Exibir o resumo somente para períodos mensais e considerar os filtros ativos de tipo, categoria e busca.
- Manter receitas fora desse controle de pagamento.
- Validar a compilação e o fluxo completo de marcar e desmarcar uma despesa.
