-- Remove campos de duração e prazo de pagamento da tabela contratos
ALTER TABLE contratos 
DROP COLUMN IF EXISTS duracao_meses,
DROP COLUMN IF EXISTS prazo_pagamento_dias;

-- Adicionar comentário explicativo
COMMENT ON TABLE contratos IS 'Tabela de contratos - datas são controladas manualmente pelo usuário';
