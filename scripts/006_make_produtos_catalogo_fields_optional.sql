-- Tornar todos os campos opcionais na tabela produtos_catalogo
-- Isso permite adicionar produtos sem preencher todos os campos

-- Remover constraint NOT NULL da coluna preco_diario
ALTER TABLE public.produtos_catalogo 
ALTER COLUMN preco_diario DROP NOT NULL;

-- Remover constraint NOT NULL da coluna nome (tornar opcional)
ALTER TABLE public.produtos_catalogo 
ALTER COLUMN nome DROP NOT NULL;

-- Remover constraint NOT NULL da coluna categoria (tornar opcional)
ALTER TABLE public.produtos_catalogo 
ALTER COLUMN categoria DROP NOT NULL;

-- Comentário: Agora todos os campos são opcionais
-- O usuário pode adicionar produtos preenchendo apenas os campos desejados
COMMENT ON TABLE public.produtos_catalogo IS 'Tabela de produtos do catálogo - todos os campos são opcionais';
