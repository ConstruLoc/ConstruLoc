-- Disable RLS for development on contratos and related tables
-- This allows all operations without authentication checks

-- Drop all existing policies for contratos
DROP POLICY IF EXISTS "Users can view own contracts" ON contratos;
DROP POLICY IF EXISTS "Users can create contracts" ON contratos;
DROP POLICY IF EXISTS "Users can update own contracts" ON contratos;
DROP POLICY IF EXISTS "Users can delete own contracts" ON contratos;
DROP POLICY IF EXISTS "Enable read access for all users" ON contratos;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON contratos;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON contratos;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON contratos;

-- Drop all existing policies for itens_contrato
DROP POLICY IF EXISTS "Users can view contract items" ON itens_contrato;
DROP POLICY IF EXISTS "Users can create contract items" ON itens_contrato;
DROP POLICY IF EXISTS "Users can update contract items" ON itens_contrato;
DROP POLICY IF EXISTS "Users can delete contract items" ON itens_contrato;
DROP POLICY IF EXISTS "Enable read access for all users" ON itens_contrato;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON itens_contrato;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON itens_contrato;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON itens_contrato;

-- Disable RLS on contratos table
ALTER TABLE contratos DISABLE ROW LEVEL SECURITY;

-- Disable RLS on itens_contrato table
ALTER TABLE itens_contrato DISABLE ROW LEVEL SECURITY;

-- Grant full access to authenticated users
GRANT ALL ON contratos TO authenticated;
GRANT ALL ON itens_contrato TO authenticated;

-- Grant full access to anon users (for development)
GRANT ALL ON contratos TO anon;
GRANT ALL ON itens_contrato TO anon;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('contratos', 'itens_contrato');
