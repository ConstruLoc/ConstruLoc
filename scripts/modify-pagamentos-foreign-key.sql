-- Modificar a foreign key da tabela pagamentos para permitir NULL quando o contrato for excluído
-- Isso permite manter o histórico de pagamentos mesmo após a exclusão do contrato

-- 1. Remover a constraint existente
ALTER TABLE pagamentos 
DROP CONSTRAINT IF EXISTS pagamentos_contrato_id_fkey;

-- 2. Adicionar nova constraint com ON DELETE SET NULL
ALTER TABLE pagamentos 
ADD CONSTRAINT pagamentos_contrato_id_fkey 
FOREIGN KEY (contrato_id) 
REFERENCES contratos(id) 
ON DELETE SET NULL;

-- 3. Adicionar coluna para armazenar informações do contrato excluído
ALTER TABLE pagamentos 
ADD COLUMN IF NOT EXISTS contrato_numero VARCHAR(50),
ADD COLUMN IF NOT EXISTS contrato_excluido BOOLEAN DEFAULT FALSE;

-- 4. Atualizar registros existentes com o número do contrato
UPDATE pagamentos p
SET contrato_numero = c.numero_contrato
FROM contratos c
WHERE p.contrato_id = c.id AND p.contrato_numero IS NULL;
