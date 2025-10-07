-- Desabilitar RLS na tabela contratos para permitir operações sem autenticação
-- ATENÇÃO: Isso remove a segurança de linha. Use apenas em desenvolvimento ou se você tem outro método de segurança.

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "contratos_all_authenticated" ON contratos;
DROP POLICY IF EXISTS "Admin and operators can view all contracts" ON contratos;
DROP POLICY IF EXISTS "Admin and operators can manage contracts" ON contratos;

-- Desabilitar RLS completamente
ALTER TABLE contratos DISABLE ROW LEVEL SECURITY;

-- Verificar o status
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'contratos';
