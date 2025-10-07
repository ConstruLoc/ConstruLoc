-- Add 'numero' column to 'clientes' table
-- This column will store the house/building number for the client's address

ALTER TABLE clientes
ADD COLUMN numero VARCHAR(20);

-- Add a comment to the column for documentation
COMMENT ON COLUMN clientes.numero IS 'Número da residência ou estabelecimento do cliente';
