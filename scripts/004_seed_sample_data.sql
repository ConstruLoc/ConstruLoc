-- Seed sample data for testing
-- This script only inserts data if it doesn't already exist

-- Insert sample categories (only if they don't exist)
INSERT INTO categorias_equipamentos (id, nome, descricao, created_at)
SELECT gen_random_uuid(), nome, descricao, NOW()
FROM (VALUES
  ('Escavadeiras', 'Equipamentos para escavação e movimentação de terra'),
  ('Guindastes', 'Equipamentos para elevação e movimentação de cargas'),
  ('Betoneiras', 'Equipamentos para mistura e preparo de concreto'),
  ('Compactadores', 'Equipamentos para compactação de solo e asfalto'),
  ('Geradores', 'Equipamentos para geração de energia elétrica')
) AS data(nome, descricao)
WHERE NOT EXISTS (
  SELECT 1 FROM categorias_equipamentos WHERE categorias_equipamentos.nome = data.nome
);

-- Adicionar cast ::equipment_status para corrigir erro de tipo
-- Insert sample equipment (only if they don't exist)
INSERT INTO equipamentos (id, nome, descricao, marca, modelo, numero_serie, categoria_id, valor_diario, valor_semanal, valor_mensal, status, localizacao, ano_fabricacao, created_at, updated_at) 
SELECT 
    gen_random_uuid(), 
    nome, 
    descricao, 
    marca, 
    modelo, 
    numero_serie, 
    (SELECT id FROM categorias_equipamentos WHERE nome = categoria LIMIT 1),
    valor_diario, 
    valor_semanal, 
    valor_mensal, 
    status::equipment_status, 
    localizacao, 
    ano_fabricacao, 
    NOW(), 
    NOW()
FROM (VALUES
    ('Escavadeira Hidráulica CAT 320D', 'Escavadeira hidráulica para trabalhos pesados de escavação', 'Caterpillar', '320D', 'CAT320D001', 'Escavadeiras', 450.00, 2800.00, 10500.00, 'disponivel', 'Pátio Principal', 2020),
    ('Escavadeira Compacta JCB 8025', 'Escavadeira compacta ideal para espaços reduzidos', 'JCB', '8025', 'JCB8025001', 'Escavadeiras', 280.00, 1750.00, 6500.00, 'disponivel', 'Pátio Principal', 2019),
    ('Guindaste Móvel Liebherr LTM 1030', 'Guindaste móvel com capacidade de 30 toneladas', 'Liebherr', 'LTM 1030', 'LIE1030001', 'Guindastes', 650.00, 4200.00, 16000.00, 'disponivel', 'Pátio de Guindastes', 2021),
    ('Betoneira Estacionária 400L', 'Betoneira estacionária para preparo de concreto', 'Menegotti', 'BT-400', 'MEN400001', 'Betoneiras', 85.00, 520.00, 1950.00, 'disponivel', 'Área de Betoneiras', 2018),
    ('Compactador de Solo Dynapac CA250', 'Compactador vibratório para solo e asfalto', 'Dynapac', 'CA250', 'DYN250001', 'Compactadores', 320.00, 2000.00, 7500.00, 'disponivel', 'Pátio de Compactadores', 2020),
    ('Gerador Diesel 100kVA', 'Gerador diesel silenciado para obras', 'Cummins', 'C100D5', 'CUM100001', 'Geradores', 180.00, 1100.00, 4200.00, 'disponivel', 'Área de Geradores', 2019),
    ('Escavadeira Hidráulica Volvo EC210', 'Escavadeira hidráulica de médio porte', 'Volvo', 'EC210', 'VOL210001', 'Escavadeiras', 420.00, 2650.00, 9800.00, 'locado', 'Em Campo - Obra Centro', 2021),
    ('Guindaste Torre Potain MD 189', 'Guindaste torre para construção civil', 'Potain', 'MD 189', 'POT189001', 'Guindastes', 850.00, 5500.00, 21000.00, 'manutencao', 'Oficina', 2020)
) AS data(nome, descricao, marca, modelo, numero_serie, categoria, valor_diario, valor_semanal, valor_mensal, status, localizacao, ano_fabricacao)
WHERE NOT EXISTS (
    SELECT 1 FROM equipamentos WHERE equipamentos.numero_serie = data.numero_serie
);
