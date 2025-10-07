-- Adiciona novos campos à tabela profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS cep TEXT,
ADD COLUMN IF NOT EXISTS cidade TEXT,
ADD COLUMN IF NOT EXISTS estado TEXT;

-- Adiciona comentários para documentação
COMMENT ON COLUMN profiles.email IS 'Email do usuário';
COMMENT ON COLUMN profiles.cep IS 'CEP do endereço';
COMMENT ON COLUMN profiles.cidade IS 'Cidade';
COMMENT ON COLUMN profiles.estado IS 'Estado (UF)';
