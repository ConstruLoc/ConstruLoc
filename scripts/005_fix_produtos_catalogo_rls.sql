-- Atualizar a tabela produtos_catalogo para permitir user_id null
-- e ajustar as políticas RLS para permitir operações sem autenticação

-- Tornar user_id opcional (permitir NULL)
ALTER TABLE produtos_catalogo 
ALTER COLUMN user_id DROP NOT NULL;

-- Remover políticas RLS existentes
DROP POLICY IF EXISTS "Usuários podem inserir seus próprios produtos" ON produtos_catalogo;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios produtos" ON produtos_catalogo;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios produtos" ON produtos_catalogo;
DROP POLICY IF EXISTS "Todos podem visualizar produtos" ON produtos_catalogo;

-- Criar novas políticas RLS mais permissivas
-- Permitir que todos visualizem produtos
CREATE POLICY "Permitir visualização pública de produtos"
ON produtos_catalogo FOR SELECT
USING (true);

-- Permitir inserção sem autenticação (para desenvolvimento)
CREATE POLICY "Permitir inserção de produtos"
ON produtos_catalogo FOR INSERT
WITH CHECK (true);

-- Permitir atualização sem autenticação (para desenvolvimento)
CREATE POLICY "Permitir atualização de produtos"
ON produtos_catalogo FOR UPDATE
USING (true);

-- Permitir exclusão sem autenticação (para desenvolvimento)
CREATE POLICY "Permitir exclusão de produtos"
ON produtos_catalogo FOR DELETE
USING (true);

-- Comentário: Em produção, você deve restringir essas políticas
-- para permitir apenas usuários autenticados ou roles específicos
