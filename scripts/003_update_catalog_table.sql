-- Adicionar coluna preco_normal à tabela produtos_catalogo
ALTER TABLE produtos_catalogo 
ADD COLUMN IF NOT EXISTS preco_normal DECIMAL(10,2);

-- Comentário explicativo
COMMENT ON COLUMN produtos_catalogo.preco_normal IS 'Preço normal do produto (diferente do preço por dia)';
