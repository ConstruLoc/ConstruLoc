-- Tornar os campos de valor opcionais na tabela de equipamentos
ALTER TABLE equipamentos 
  ALTER COLUMN valor_mensal DROP NOT NULL,
  ALTER COLUMN valor_diario DROP NOT NULL;

-- Comentário explicativo
COMMENT ON COLUMN equipamentos.valor_mensal IS 'Valor mensal de locação do equipamento (opcional)';
COMMENT ON COLUMN equipamentos.valor_diario IS 'Valor diário de locação do equipamento (opcional)';
