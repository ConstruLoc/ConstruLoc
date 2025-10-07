-- Add quantidade column to equipamentos table
ALTER TABLE equipamentos
ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 1;

-- Add comment to explain the column
COMMENT ON COLUMN equipamentos.quantidade IS 'Quantidade de unidades disponíveis deste equipamento em estoque';

-- Update existing records to have at least 1 unit
UPDATE equipamentos
SET quantidade = 1
WHERE quantidade IS NULL OR quantidade = 0;
