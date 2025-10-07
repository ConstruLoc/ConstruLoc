-- Enable RLS and add policies for categorias_equipamentos table
-- This script configures Row Level Security to allow all users to manage categories

-- First, ensure RLS is enabled on the table
ALTER TABLE categorias_equipamentos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow all users to read categories" ON categorias_equipamentos;
DROP POLICY IF EXISTS "Allow all users to insert categories" ON categorias_equipamentos;
DROP POLICY IF EXISTS "Allow all users to update categories" ON categorias_equipamentos;
DROP POLICY IF EXISTS "Allow all users to delete categories" ON categorias_equipamentos;

-- Create policies that allow both anonymous and authenticated users full access

-- Allow SELECT (read) for all users
CREATE POLICY "Allow all users to read categories"
ON categorias_equipamentos
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow INSERT (create) for all users
CREATE POLICY "Allow all users to insert categories"
ON categorias_equipamentos
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow UPDATE (edit) for all users
CREATE POLICY "Allow all users to update categories"
ON categorias_equipamentos
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Allow DELETE (remove) for all users
CREATE POLICY "Allow all users to delete categories"
ON categorias_equipamentos
FOR DELETE
TO anon, authenticated
USING (true);

-- Verify the policies were created successfully
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'categorias_equipamentos';
