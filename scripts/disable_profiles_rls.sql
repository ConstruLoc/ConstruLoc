-- Desabilita completamente o RLS na tabela profiles
-- Isso permite que o sistema crie e acesse perfis sem autenticação

-- Remove todas as políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON profiles;

-- Desabilita o RLS completamente
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Garante que a tabela profiles existe e tem a estrutura correta
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  nome TEXT NOT NULL,
  telefone TEXT,
  empresa TEXT,
  documento TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  role TEXT DEFAULT 'admin',
  notificacoes_ativas BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cria um perfil admin padrão se não existir
INSERT INTO profiles (email, nome, empresa, role)
VALUES ('admin@construloc.com', 'Administrador', 'ConstruLoc', 'admin')
ON CONFLICT DO NOTHING;
