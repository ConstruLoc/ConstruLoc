-- Reset database - Keep only equipamentos table and clear all other data
-- This script will be executed to clean the database as requested

-- Disable foreign key checks temporarily
SET session_replication_role = replica;

-- Clear all tables except equipamentos (keep structure and data)
TRUNCATE TABLE pagamentos CASCADE;
TRUNCATE TABLE itens_contrato CASCADE;
TRUNCATE TABLE contratos CASCADE;
TRUNCATE TABLE manutencoes CASCADE;
TRUNCATE TABLE disponibilidade_equipamentos CASCADE;
TRUNCATE TABLE clientes CASCADE;
TRUNCATE TABLE configuracoes CASCADE;
TRUNCATE TABLE profiles CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Insert default admin profile for the system
INSERT INTO profiles (id, nome, email, empresa, role, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'Administrador',
  'admin@construloc.com',
  'ConstruLoc',
  'admin',
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  email = EXCLUDED.email,
  empresa = EXCLUDED.empresa,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Insert default system configurations
INSERT INTO configuracoes (id, chave, valor, descricao, updated_at) VALUES
(gen_random_uuid(), 'empresa_nome', 'ConstruLoc', 'Nome da empresa', NOW()),
(gen_random_uuid(), 'empresa_email', 'construloc.contato@gmail.com', 'Email da empresa', NOW()),
(gen_random_uuid(), 'empresa_telefone', '(17) 17-99781-6318', 'Telefone da empresa', NOW()),
(gen_random_uuid(), 'empresa_endereco', 'Rua das Construções, 123 - Centro', 'Endereço da empresa', NOW()),
(gen_random_uuid(), 'notificacoes_email', 'true', 'Notificações por email ativadas', NOW()),
(gen_random_uuid(), 'notificacoes_sms', 'true', 'Notificações por SMS ativadas', NOW()),
(gen_random_uuid(), 'backup_automatico', 'true', 'Backup automático ativado', NOW())
ON CONFLICT (chave) DO UPDATE SET
  valor = EXCLUDED.valor,
  updated_at = NOW();
