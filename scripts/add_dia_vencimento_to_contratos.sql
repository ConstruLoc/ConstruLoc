-- Adicionar campo dia_vencimento à tabela contratos
ALTER TABLE contratos 
ADD COLUMN IF NOT EXISTS dia_vencimento INTEGER DEFAULT 5 CHECK (dia_vencimento >= 1 AND dia_vencimento <= 31);

-- Comentário explicativo
COMMENT ON COLUMN contratos.dia_vencimento IS 'Dia fixo do mês para vencimento dos pagamentos mensais (1-31). Notificação será enviada 5 dias antes.';

-- Atualizar contratos existentes para usar dia 5 como padrão
UPDATE contratos 
SET dia_vencimento = 5 
WHERE dia_vencimento IS NULL;
