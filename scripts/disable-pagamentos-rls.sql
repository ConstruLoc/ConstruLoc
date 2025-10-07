-- Desabilita RLS na tabela pagamentos para permitir inserções
-- Esta é uma solução temporária para desenvolvimento
-- Em produção, você deve criar políticas RLS adequadas

-- Remove todas as políticas existentes da tabela pagamentos
DROP POLICY IF EXISTS "Admin and operators can view all payments" ON public.pagamentos;
DROP POLICY IF EXISTS "Admin and operators can manage payments" ON public.pagamentos;
DROP POLICY IF EXISTS "pagamentos_all_authenticated" ON public.pagamentos;

-- Desabilita RLS completamente na tabela pagamentos
ALTER TABLE public.pagamentos DISABLE ROW LEVEL SECURITY;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'RLS desabilitado na tabela pagamentos com sucesso!';
END $$;
