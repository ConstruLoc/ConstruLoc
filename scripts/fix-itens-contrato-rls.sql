-- Fix RLS policies for itens_contrato table to allow authenticated users to insert/update
-- This ensures contract items can be created along with contracts

-- Drop existing policies
DROP POLICY IF EXISTS "itens_contrato_all_authenticated" ON itens_contrato;

-- Create comprehensive policies for itens_contrato table
-- Allow authenticated users to view all contract items
CREATE POLICY "itens_contrato_select_authenticated" 
ON itens_contrato 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert contract items
CREATE POLICY "itens_contrato_insert_authenticated" 
ON itens_contrato 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update contract items
CREATE POLICY "itens_contrato_update_authenticated" 
ON itens_contrato 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to delete contract items
CREATE POLICY "itens_contrato_delete_authenticated" 
ON itens_contrato 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Ensure RLS is enabled
ALTER TABLE itens_contrato ENABLE ROW LEVEL SECURITY;

-- Verify the policies
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
WHERE tablename = 'itens_contrato'
ORDER BY policyname;
