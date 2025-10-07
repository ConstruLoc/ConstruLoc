-- Enable Row Level Security for all tables
-- This ensures data security and proper access control

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_contrato ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE manutencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE disponibilidade_equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id OR auth.uid() IS NOT NULL);
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE USING (auth.uid() = id);

-- Create policies for other tables (allow authenticated users to access all data)
-- In a real-world scenario, you might want more restrictive policies

-- Clientes policies
DROP POLICY IF EXISTS "clientes_all_authenticated" ON clientes;
CREATE POLICY "clientes_all_authenticated" ON clientes FOR ALL USING (auth.uid() IS NOT NULL);

-- Equipamentos policies
DROP POLICY IF EXISTS "equipamentos_all_authenticated" ON equipamentos;
CREATE POLICY "equipamentos_all_authenticated" ON equipamentos FOR ALL USING (auth.uid() IS NOT NULL);

-- Categorias policies
DROP POLICY IF EXISTS "categorias_all_authenticated" ON categorias_equipamentos;
CREATE POLICY "categorias_all_authenticated" ON categorias_equipamentos FOR ALL USING (auth.uid() IS NOT NULL);

-- Contratos policies
DROP POLICY IF EXISTS "contratos_all_authenticated" ON contratos;
CREATE POLICY "contratos_all_authenticated" ON contratos FOR ALL USING (auth.uid() IS NOT NULL);

-- Itens contrato policies
DROP POLICY IF EXISTS "itens_contrato_all_authenticated" ON itens_contrato;
CREATE POLICY "itens_contrato_all_authenticated" ON itens_contrato FOR ALL USING (auth.uid() IS NOT NULL);

-- Pagamentos policies
DROP POLICY IF EXISTS "pagamentos_all_authenticated" ON pagamentos;
CREATE POLICY "pagamentos_all_authenticated" ON pagamentos FOR ALL USING (auth.uid() IS NOT NULL);

-- Manutencoes policies
DROP POLICY IF EXISTS "manutencoes_all_authenticated" ON manutencoes;
CREATE POLICY "manutencoes_all_authenticated" ON manutencoes FOR ALL USING (auth.uid() IS NOT NULL);

-- Disponibilidade policies
DROP POLICY IF EXISTS "disponibilidade_all_authenticated" ON disponibilidade_equipamentos;
CREATE POLICY "disponibilidade_all_authenticated" ON disponibilidade_equipamentos FOR ALL USING (auth.uid() IS NOT NULL);

-- Configuracoes policies
DROP POLICY IF EXISTS "configuracoes_all_authenticated" ON configuracoes;
CREATE POLICY "configuracoes_all_authenticated" ON configuracoes FOR ALL USING (auth.uid() IS NOT NULL);
