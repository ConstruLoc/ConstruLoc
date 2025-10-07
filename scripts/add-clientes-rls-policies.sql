-- Adiciona políticas de Row Level Security para a tabela clientes
-- Permite que usuários autenticados possam criar, ler, atualizar e deletar clientes

-- Habilita RLS na tabela clientes (caso não esteja habilitado)
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

-- Remove políticas existentes se houver (para evitar conflitos)
DROP POLICY IF EXISTS "Permitir leitura de clientes para usuários autenticados" ON clientes;
DROP POLICY IF EXISTS "Permitir inserção de clientes para usuários autenticados" ON clientes;
DROP POLICY IF EXISTS "Permitir atualização de clientes para usuários autenticados" ON clientes;
DROP POLICY IF EXISTS "Permitir exclusão de clientes para usuários autenticados" ON clientes;

-- Política para SELECT (leitura)
CREATE POLICY "Permitir leitura de clientes para usuários autenticados"
ON clientes
FOR SELECT
TO authenticated
USING (true);

-- Política para INSERT (criação)
CREATE POLICY "Permitir inserção de clientes para usuários autenticados"
ON clientes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Política para UPDATE (atualização)
CREATE POLICY "Permitir atualização de clientes para usuários autenticados"
ON clientes
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Política para DELETE (exclusão)
CREATE POLICY "Permitir exclusão de clientes para usuários autenticados"
ON clientes
FOR DELETE
TO authenticated
USING (true);
