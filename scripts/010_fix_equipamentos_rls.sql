-- Desabilitar RLS temporariamente para limpar políticas antigas
ALTER TABLE equipamentos DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas antigas da tabela equipamentos
DROP POLICY IF EXISTS "Permitir leitura pública de equipamentos" ON equipamentos;
DROP POLICY IF EXISTS "Permitir inserção pública de equipamentos" ON equipamentos;
DROP POLICY IF EXISTS "Permitir atualização pública de equipamentos" ON equipamentos;
DROP POLICY IF EXISTS "Permitir exclusão pública de equipamentos" ON equipamentos;
DROP POLICY IF EXISTS "Permitir leitura de equipamentos" ON equipamentos;
DROP POLICY IF EXISTS "Permitir inserção de equipamentos" ON equipamentos;
DROP POLICY IF EXISTS "Permitir atualização de equipamentos" ON equipamentos;
DROP POLICY IF EXISTS "Permitir exclusão de equipamentos" ON equipamentos;

-- Reabilitar RLS
ALTER TABLE equipamentos ENABLE ROW LEVEL SECURITY;

-- Criar políticas completamente permissivas para equipamentos
-- Permitir SELECT (leitura) para todos
CREATE POLICY "Permitir leitura pública de equipamentos"
ON equipamentos FOR SELECT
TO anon, authenticated
USING (true);

-- Permitir INSERT (criação) para todos
CREATE POLICY "Permitir inserção pública de equipamentos"
ON equipamentos FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Permitir UPDATE (atualização) para todos
CREATE POLICY "Permitir atualização pública de equipamentos"
ON equipamentos FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Permitir DELETE (exclusão) para todos
CREATE POLICY "Permitir exclusão pública de equipamentos"
ON equipamentos FOR DELETE
TO anon, authenticated
USING (true);

-- Verificar se as políticas foram criadas corretamente
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'equipamentos'
ORDER BY policyname;
