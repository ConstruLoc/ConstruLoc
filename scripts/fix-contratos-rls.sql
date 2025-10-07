-- Fix RLS policies for contratos table to allow authenticated users to insert/update
-- This script ensures that authenticated users can create and manage contracts

-- Drop existing policies
DROP POLICY IF EXISTS "contratos_all_authenticated" ON contratos;
DROP POLICY IF EXISTS "Admin and operators can view all contracts" ON contratos;
DROP POLICY IF EXISTS "Admin and operators can manage contracts" ON contratos;

-- Create comprehensive policies for contratos table
-- Allow authenticated users to view all contracts
CREATE POLICY "contratos_select_authenticated" 
ON contratos 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to insert contracts
CREATE POLICY "contratos_insert_authenticated" 
ON contratos 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to update contracts
CREATE POLICY "contratos_update_authenticated" 
ON contratos 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to delete contracts
CREATE POLICY "contratos_delete_authenticated" 
ON contratos 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Ensure RLS is enabled
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;

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
WHERE tablename = 'contratos'
ORDER BY policyname;
