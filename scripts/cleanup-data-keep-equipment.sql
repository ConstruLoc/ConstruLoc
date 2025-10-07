-- Script para limpar todos os dados exceto equipamentos e categorias
-- Mantém: equipamentos, categorias_equipamentos
-- Remove: todos os outros dados (contratos, clientes, pagamentos, etc.)

-- Desabilitar triggers temporariamente para evitar problemas de foreign key
SET session_replication_role = 'replica';

-- Limpar dados de webhooks e transações de pagamento
DELETE FROM webhooks_pagamento;
DELETE FROM transacoes_pagamento;
DELETE FROM parcelas_pagamento;
DELETE FROM pagamentos;

-- Limpar faturas
DELETE FROM faturas;

-- Limpar itens de contrato e contratos
DELETE FROM itens_contrato;
DELETE FROM contratos;

-- Limpar reservas
DELETE FROM reservas;

-- Limpar notificações
DELETE FROM notificacoes;

-- Limpar manutenções
DELETE FROM manutencoes;

-- Limpar disponibilidade de equipamentos
DELETE FROM disponibilidade_equipamentos;

-- Limpar clientes
DELETE FROM clientes;

-- Limpar produtos do catálogo
DELETE FROM produtos_catalogo;

-- Limpar métodos de pagamento
DELETE FROM metodos_pagamento;

-- Limpar configurações (opcional - descomente se quiser limpar)
-- DELETE FROM configuracoes;

-- Limpar profiles (usuários) - CUIDADO: isso vai remover todos os usuários
-- Se você quiser manter seu usuário admin, comente a linha abaixo
DELETE FROM profiles;

-- Reabilitar triggers
SET session_replication_role = 'origin';

-- Resetar sequências (se houver)
-- Isso garante que os IDs comecem do início novamente

SELECT 'Limpeza concluída! Equipamentos e categorias foram mantidos.' as resultado;
