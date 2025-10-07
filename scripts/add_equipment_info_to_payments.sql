-- Add columns to store equipment information in payments table
ALTER TABLE pagamentos
ADD COLUMN IF NOT EXISTS equipamentos_info JSONB;

-- Add comment to explain the column
COMMENT ON COLUMN pagamentos.equipamentos_info IS 'Stores equipment details when contract is deleted: [{nome, marca, modelo, quantidade}]';
