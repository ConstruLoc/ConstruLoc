-- Adicionar coluna user_id à tabela produtos_catalogo
ALTER TABLE public.produtos_catalogo 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_produtos_catalogo_user_id ON public.produtos_catalogo(user_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.produtos_catalogo ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver todos os produtos
CREATE POLICY "Usuários podem ver todos os produtos"
ON public.produtos_catalogo
FOR SELECT
TO authenticated
USING (true);

-- Política: Usuários podem inserir seus próprios produtos
CREATE POLICY "Usuários podem inserir produtos"
ON public.produtos_catalogo
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem atualizar seus próprios produtos
CREATE POLICY "Usuários podem atualizar seus produtos"
ON public.produtos_catalogo
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política: Usuários podem deletar seus próprios produtos
CREATE POLICY "Usuários podem deletar seus produtos"
ON public.produtos_catalogo
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Atualizar produtos existentes para associar ao primeiro usuário (se houver)
-- Isso é apenas para dados de exemplo, remova se não necessário
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  SELECT id INTO first_user_id FROM auth.users LIMIT 1;
  
  IF first_user_id IS NOT NULL THEN
    UPDATE public.produtos_catalogo 
    SET user_id = first_user_id 
    WHERE user_id IS NULL;
  END IF;
END $$;
