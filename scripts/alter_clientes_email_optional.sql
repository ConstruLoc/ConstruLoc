-- Remove a constraint NOT NULL da coluna email na tabela clientes
-- Isso permite que clientes sejam cadastrados sem e-mail

ALTER TABLE clientes 
ALTER COLUMN email DROP NOT NULL;

-- Comentário: A coluna email agora aceita valores NULL
-- Múltiplos clientes podem ter email NULL sem violar constraints
