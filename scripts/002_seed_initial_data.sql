-- Seed initial data for ConstruLoc system

-- Insert equipment categories
INSERT INTO public.categorias_equipamentos (id, nome, descricao) VALUES
  (uuid_generate_v4(), 'Escavação', 'Equipamentos para escavação e movimentação de terra'),
  (uuid_generate_v4(), 'Compactação', 'Equipamentos para compactação de solo e asfalto'),
  (uuid_generate_v4(), 'Elevação', 'Equipamentos para elevação de materiais e pessoas'),
  (uuid_generate_v4(), 'Concreto', 'Equipamentos para preparo e aplicação de concreto'),
  (uuid_generate_v4(), 'Ferramentas Elétricas', 'Ferramentas elétricas diversas'),
  (uuid_generate_v4(), 'Geração de Energia', 'Geradores e equipamentos de energia');

-- Insert sample equipment (using category IDs from above)
INSERT INTO public.equipamentos (nome, descricao, categoria_id, modelo, marca, valor_diario, valor_semanal, valor_mensal, status) VALUES
  ('Escavadeira Hidráulica 20t', 'Escavadeira hidráulica para trabalhos pesados', (SELECT id FROM categorias_equipamentos WHERE nome = 'Escavação' LIMIT 1), 'PC200', 'Komatsu', 450.00, 2700.00, 10800.00, 'disponivel'),
  ('Retroescavadeira', 'Retroescavadeira para escavação e carregamento', (SELECT id FROM categorias_equipamentos WHERE nome = 'Escavação' LIMIT 1), '416F2', 'Caterpillar', 320.00, 1920.00, 7680.00, 'disponivel'),
  ('Rolo Compactador', 'Rolo compactador vibratório para asfalto', (SELECT id FROM categorias_equipamentos WHERE nome = 'Compactação' LIMIT 1), 'CC424HF', 'Dynapac', 280.00, 1680.00, 6720.00, 'disponivel'),
  ('Plataforma Elevatória', 'Plataforma elevatória tesoura 12m', (SELECT id FROM categorias_equipamentos WHERE nome = 'Elevação' LIMIT 1), 'GS-3246', 'Genie', 180.00, 1080.00, 4320.00, 'disponivel'),
  ('Betoneira 400L', 'Betoneira basculante 400 litros', (SELECT id FROM categorias_equipamentos WHERE nome = 'Concreto' LIMIT 1), 'CSM-400', 'CS Unitec', 85.00, 510.00, 2040.00, 'disponivel'),
  ('Gerador 15kVA', 'Gerador diesel silenciado 15kVA', (SELECT id FROM categorias_equipamentos WHERE nome = 'Geração de Energia' LIMIT 1), 'QAS-15', 'Atlas Copco', 120.00, 720.00, 2880.00, 'disponivel');

-- Insert system configurations
INSERT INTO public.configuracoes (chave, valor, descricao) VALUES
  ('empresa_nome', 'ConstruLoc', 'Nome da empresa'),
  ('empresa_telefone', '(11) 99999-9999', 'Telefone da empresa'),
  ('empresa_email', 'contato@construloc.com.br', 'Email da empresa'),
  ('empresa_endereco', 'Rua das Construções, 123 - São Paulo, SP', 'Endereço da empresa'),
  ('multa_atraso_percentual', '2.0', 'Percentual de multa por atraso na devolução (por dia)'),
  ('desconto_semanal_percentual', '15.0', 'Percentual de desconto para locação semanal'),
  ('desconto_mensal_percentual', '25.0', 'Percentual de desconto para locação mensal');
