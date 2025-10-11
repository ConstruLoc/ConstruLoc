-- Seed initial data for ConstruLoc system
-- This script only inserts data if it doesn't already exist

-- Insert equipment categories (only if they don't exist)
INSERT INTO public.categorias_equipamentos (id, nome, descricao)
SELECT uuid_generate_v4(), nome, descricao
FROM (VALUES
  ('Escavação', 'Equipamentos para escavação e movimentação de terra'),
  ('Compactação', 'Equipamentos para compactação de solo e asfalto'),
  ('Elevação', 'Equipamentos para elevação de materiais e pessoas'),
  ('Concreto', 'Equipamentos para preparo e aplicação de concreto'),
  ('Ferramentas Elétricas', 'Ferramentas elétricas diversas'),
  ('Geração de Energia', 'Geradores e equipamentos de energia')
) AS data(nome, descricao)
WHERE NOT EXISTS (
  SELECT 1 FROM categorias_equipamentos WHERE categorias_equipamentos.nome = data.nome
);

-- Adicionar cast ::equipment_status para corrigir erro de tipo
-- Insert sample equipment (only if they don't exist)
INSERT INTO public.equipamentos (nome, descricao, categoria_id, modelo, marca, valor_diario, valor_semanal, valor_mensal, status)
SELECT nome, descricao, categoria_id, modelo, marca, valor_diario, valor_semanal, valor_mensal, status::equipment_status
FROM (VALUES
  ('Escavadeira Hidráulica 20t', 'Escavadeira hidráulica para trabalhos pesados', (SELECT id FROM categorias_equipamentos WHERE nome = 'Escavação' LIMIT 1), 'PC200', 'Komatsu', 450.00, 2700.00, 10800.00, 'disponivel'),
  ('Retroescavadeira', 'Retroescavadeira para escavação e carregamento', (SELECT id FROM categorias_equipamentos WHERE nome = 'Escavação' LIMIT 1), '416F2', 'Caterpillar', 320.00, 1920.00, 7680.00, 'disponivel'),
  ('Rolo Compactador', 'Rolo compactador vibratório para asfalto', (SELECT id FROM categorias_equipamentos WHERE nome = 'Compactação' LIMIT 1), 'CC424HF', 'Dynapac', 280.00, 1680.00, 6720.00, 'disponivel'),
  ('Plataforma Elevatória', 'Plataforma elevatória tesoura 12m', (SELECT id FROM categorias_equipamentos WHERE nome = 'Elevação' LIMIT 1), 'GS-3246', 'Genie', 180.00, 1080.00, 4320.00, 'disponivel'),
  ('Betoneira 400L', 'Betoneira basculante 400 litros', (SELECT id FROM categorias_equipamentos WHERE nome = 'Concreto' LIMIT 1), 'CSM-400', 'CS Unitec', 85.00, 510.00, 2040.00, 'disponivel'),
  ('Gerador 15kVA', 'Gerador diesel silenciado 15kVA', (SELECT id FROM categorias_equipamentos WHERE nome = 'Geração de Energia' LIMIT 1), 'QAS-15', 'Atlas Copco', 120.00, 720.00, 2880.00, 'disponivel')
) AS data(nome, descricao, categoria_id, modelo, marca, valor_diario, valor_semanal, valor_mensal, status)
WHERE NOT EXISTS (
  SELECT 1 FROM equipamentos WHERE equipamentos.nome = data.nome
);

-- Insert system configurations (only if they don't exist)
INSERT INTO public.configuracoes (chave, valor, descricao)
SELECT chave, valor, descricao
FROM (VALUES
  ('empresa_nome', 'ConstruLoc', 'Nome da empresa'),
  ('empresa_telefone', '(11) 99999-9999', 'Telefone da empresa'),
  ('empresa_email', 'contato@construloc.com.br', 'Email da empresa'),
  ('empresa_endereco', 'Rua das Construções, 123 - São Paulo, SP', 'Endereço da empresa'),
  ('multa_atraso_percentual', '2.0', 'Percentual de multa por atraso na devolução (por dia)'),
  ('desconto_semanal_percentual', '15.0', 'Percentual de desconto para locação semanal'),
  ('desconto_mensal_percentual', '25.0', 'Percentual de desconto para locação mensal')
) AS data(chave, valor, descricao)
WHERE NOT EXISTS (
  SELECT 1 FROM configuracoes WHERE configuracoes.chave = data.chave
);
