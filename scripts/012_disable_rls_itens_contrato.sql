-- Desabilitar RLS para tabela itens_contrato
-- Remove todas as políticas e desabilita RLS completamente

-- Remove todas as políticas existentes da tabela itens_contrato
DROP POLICY IF EXISTS "Permitir leitura de itens_contrato" ON itens_contrato;
DROP POLICY IF EXISTS "Permitir inserção de itens_contrato" ON itens_contrato;
DROP POLICY IF EXISTS "Permitir atualização de itens_contrato" ON itens_contrato;
DROP POLICY IF EXISTS "Permitir exclusão de itens_contrato" ON itens_contrato;
DROP POLICY IF EXISTS "Enable read access for all users" ON itens_contrato;
DROP POLICY IF EXISTS "Enable insert access for all users" ON itens_contrato;
DROP POLICY IF EXISTS "Enable update access for all users" ON itens_contrato;
DROP POLICY IF EXISTS "Enable delete access for all users" ON itens_contrato;

-- Desabilita RLS completamente na tabela itens_contrato
ALTER TABLE itens_contrato DISABLE ROW LEVEL SECURITY;

-- Garante que a tabela permite todas as operações
GRANT ALL ON itens_contrato TO postgres, anon, authenticated, service_role;
