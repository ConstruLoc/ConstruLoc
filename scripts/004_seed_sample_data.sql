-- Seed sample data for testing
-- This will populate the database with sample equipment data

-- Insert sample categories
INSERT INTO categorias_equipamentos (id, nome, descricao, created_at) VALUES
(gen_random_uuid(), 'Escavadeiras', 'Equipamentos para escavação e movimentação de terra', NOW()),
(gen_random_uuid(), 'Guindastes', 'Equipamentos para elevação e movimentação de cargas', NOW()),
(gen_random_uuid(), 'Betoneiras', 'Equipamentos para mistura e preparo de concreto', NOW()),
(gen_random_uuid(), 'Compactadores', 'Equipamentos para compactação de solo e asfalto', NOW()),
(gen_random_uuid(), 'Geradores', 'Equipamentos para geração de energia elétrica', NOW())
ON CONFLICT (nome) DO NOTHING;

-- Get category IDs for equipment insertion
DO $$
DECLARE
    cat_escavadeira UUID;
    cat_guindaste UUID;
    cat_betoneira UUID;
    cat_compactador UUID;
    cat_gerador UUID;
BEGIN
    SELECT id INTO cat_escavadeira FROM categorias_equipamentos WHERE nome = 'Escavadeiras' LIMIT 1;
    SELECT id INTO cat_guindaste FROM categorias_equipamentos WHERE nome = 'Guindastes' LIMIT 1;
    SELECT id INTO cat_betoneira FROM categorias_equipamentos WHERE nome = 'Betoneiras' LIMIT 1;
    SELECT id INTO cat_compactador FROM categorias_equipamentos WHERE nome = 'Compactadores' LIMIT 1;
    SELECT id INTO cat_gerador FROM categorias_equipamentos WHERE nome = 'Geradores' LIMIT 1;

    -- Insert sample equipment
    INSERT INTO equipamentos (id, nome, descricao, marca, modelo, numero_serie, categoria_id, valor_diario, valor_semanal, valor_mensal, status, localizacao, ano_fabricacao, created_at, updated_at) VALUES
    (gen_random_uuid(), 'Escavadeira Hidráulica CAT 320D', 'Escavadeira hidráulica para trabalhos pesados de escavação', 'Caterpillar', '320D', 'CAT320D001', cat_escavadeira, 450.00, 2800.00, 10500.00, 'disponivel', 'Pátio Principal', 2020, NOW(), NOW()),
    (gen_random_uuid(), 'Escavadeira Compacta JCB 8025', 'Escavadeira compacta ideal para espaços reduzidos', 'JCB', '8025', 'JCB8025001', cat_escavadeira, 280.00, 1750.00, 6500.00, 'disponivel', 'Pátio Principal', 2019, NOW(), NOW()),
    (gen_random_uuid(), 'Guindaste Móvel Liebherr LTM 1030', 'Guindaste móvel com capacidade de 30 toneladas', 'Liebherr', 'LTM 1030', 'LIE1030001', cat_guindaste, 650.00, 4200.00, 16000.00, 'disponivel', 'Pátio de Guindastes', 2021, NOW(), NOW()),
    (gen_random_uuid(), 'Betoneira Estacionária 400L', 'Betoneira estacionária para preparo de concreto', 'Menegotti', 'BT-400', 'MEN400001', cat_betoneira, 85.00, 520.00, 1950.00, 'disponivel', 'Área de Betoneiras', 2018, NOW(), NOW()),
    (gen_random_uuid(), 'Compactador de Solo Dynapac CA250', 'Compactador vibratório para solo e asfalto', 'Dynapac', 'CA250', 'DYN250001', cat_compactador, 320.00, 2000.00, 7500.00, 'disponivel', 'Pátio de Compactadores', 2020, NOW(), NOW()),
    (gen_random_uuid(), 'Gerador Diesel 100kVA', 'Gerador diesel silenciado para obras', 'Cummins', 'C100D5', 'CUM100001', cat_gerador, 180.00, 1100.00, 4200.00, 'disponivel', 'Área de Geradores', 2019, NOW(), NOW()),
    (gen_random_uuid(), 'Escavadeira Hidráulica Volvo EC210', 'Escavadeira hidráulica de médio porte', 'Volvo', 'EC210', 'VOL210001', cat_escavadeira, 420.00, 2650.00, 9800.00, 'locado', 'Em Campo - Obra Centro', 2021, NOW(), NOW()),
    (gen_random_uuid(), 'Guindaste Torre Potain MD 189', 'Guindaste torre para construção civil', 'Potain', 'MD 189', 'POT189001', cat_guindaste, 850.00, 5500.00, 21000.00, 'manutencao', 'Oficina', 2020, NOW(), NOW())
    ON CONFLICT (numero_serie) DO NOTHING;
END $$;
