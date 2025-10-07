-- Fix RLS policies for categorias_equipamentos table
-- This script completely resets and reconfigures Row Level Security

-- Step 1: Disable RLS temporarily to clean up
ALTER TABLE categorias_equipamentos DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies to start fresh
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'categorias_equipamentos') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON categorias_equipamentos';
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE categorias_equipamentos ENABLE ROW LEVEL SECURITY;

-- Step 4: Create permissive policies that allow ALL operations for ALL users (including anon)

-- Allow SELECT (read) for everyone
CREATE POLICY "Enable read access for all users"
ON categorias_equipamentos
FOR SELECT
USING (true);

-- Allow INSERT (create) for everyone
CREATE POLICY "Enable insert access for all users"
ON categorias_equipamentos
FOR INSERT
WITH CHECK (true);

-- Allow UPDATE (edit) for everyone
CREATE POLICY "Enable update access for all users"
ON categorias_equipamentos
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow DELETE (remove) for everyone
CREATE POLICY "Enable delete access for all users"
ON categorias_equipamentos
FOR DELETE
USING (true);

-- Step 5: Grant necessary permissions to anon and authenticated roles
GRANT ALL ON categorias_equipamentos TO anon;
GRANT ALL ON categorias_equipamentos TO authenticated;

-- Step 6: Verify the setup
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive, 
    roles, 
    cmd
FROM pg_policies
WHERE tablename = 'categorias_equipamentos'
ORDER BY policyname;

-- Also check if RLS is enabled
SELECT 
    tablename, 
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'categorias_equipamentos';
