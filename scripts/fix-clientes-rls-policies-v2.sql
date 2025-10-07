-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read clients" ON clientes;
DROP POLICY IF EXISTS "Allow authenticated users to insert clients" ON clientes;
DROP POLICY IF EXISTS "Allow authenticated users to update clients" ON clientes;
DROP POLICY IF EXISTS "Allow authenticated users to delete clients" ON clientes;

-- Create permissive policies that allow all operations
-- These policies allow anyone to perform operations on the clientes table
-- This is suitable for internal management systems without user authentication

-- Allow anyone to read clients
CREATE POLICY "Allow all to read clients"
ON clientes
FOR SELECT
USING (true);

-- Allow anyone to insert clients
CREATE POLICY "Allow all to insert clients"
ON clientes
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update clients
CREATE POLICY "Allow all to update clients"
ON clientes
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow anyone to delete clients
CREATE POLICY "Allow all to delete clients"
ON clientes
FOR DELETE
USING (true);
