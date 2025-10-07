-- Remove a foreign key constraint e recria a tabela profiles sem dependência de auth.users
-- Isso permite que o sistema funcione sem autenticação

-- Drop a tabela profiles existente (se houver dados, eles serão perdidos)
DROP TABLE IF EXISTS profiles CASCADE;

-- Recriar tabela profiles sem foreign key para auth.users
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT,
  nome TEXT NOT NULL DEFAULT 'Usuário',
  telefone TEXT,
  empresa TEXT,
  documento TEXT,
  endereco TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'operador', 'cliente')),
  notificacoes_ativas BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Desabilitar RLS para permitir acesso sem autenticação
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas RLS
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- Criar um perfil padrão para o sistema
INSERT INTO profiles (nome, email, role, empresa)
VALUES ('Administrador', 'admin@construloc.com', 'admin', 'ConstruLoc')
ON CONFLICT (id) DO NOTHING;
