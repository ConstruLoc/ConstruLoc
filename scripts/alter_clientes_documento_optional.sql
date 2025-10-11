-- Make documento column optional in clientes table
-- This allows multiple clients without document by storing NULL instead of empty string

-- Remove NOT NULL constraint from documento column if it exists
ALTER TABLE clientes ALTER COLUMN documento DROP NOT NULL;

-- The UNIQUE constraint on documento will still work correctly with NULL values
-- In PostgreSQL, NULL values are considered distinct, so multiple NULL values are allowed
