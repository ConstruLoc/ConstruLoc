-- Add client information columns to pagamentos table
ALTER TABLE pagamentos 
ADD COLUMN IF NOT EXISTS cliente_nome TEXT,
ADD COLUMN IF NOT EXISTS cliente_empresa TEXT;

-- Update existing orphaned payments with client info if possible
-- This is a one-time migration for existing data
UPDATE pagamentos p
SET 
  cliente_nome = c.nome,
  cliente_empresa = c.empresa
FROM contratos ct
JOIN clientes c ON ct.cliente_id = c.id
WHERE p.contrato_id = ct.id
  AND p.contrato_excluido = true
  AND p.cliente_nome IS NULL;
