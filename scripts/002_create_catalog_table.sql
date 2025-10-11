-- Criar tabela para produtos do catálogo (separada dos equipamentos)
CREATE TABLE IF NOT EXISTS public.produtos_catalogo (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(100) NOT NULL,
    preco_diario DECIMAL(10,2) NOT NULL,
    preco_semanal DECIMAL(10,2),
    preco_mensal DECIMAL(10,2),
    imagem_url TEXT,
    especificacoes TEXT[], -- Array de especificações
    disponivel BOOLEAN DEFAULT true,
    destaque BOOLEAN DEFAULT false, -- Para produtos em destaque
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_produtos_catalogo_categoria ON public.produtos_catalogo(categoria);
CREATE INDEX IF NOT EXISTS idx_produtos_catalogo_disponivel ON public.produtos_catalogo(disponivel);
CREATE INDEX IF NOT EXISTS idx_produtos_catalogo_destaque ON public.produtos_catalogo(destaque);

-- Inserir alguns produtos de exemplo
INSERT INTO public.produtos_catalogo (nome, descricao, categoria, preco_diario, preco_semanal, preco_mensal, especificacoes, disponivel, destaque) VALUES
('Escavadeira Hidráulica CAT 320', 'Escavadeira de alta performance para obras de grande porte', 'Escavadeiras', 450.00, 2700.00, 10800.00, ARRAY['20 toneladas', 'Motor 150HP', 'Alcance 9.5m'], true, true),
('Betoneira 400L Profissional', 'Betoneira robusta para preparo de concreto', 'Betoneiras', 120.00, 720.00, 2880.00, ARRAY['400 litros', 'Motor 2HP', 'Rodas pneumáticas'], true, false),
('Guindaste Móvel 25T', 'Guindaste móvel para elevação de cargas pesadas', 'Guindastes', 800.00, 4800.00, 19200.00, ARRAY['25 toneladas', 'Altura 30m', 'Lança telescópica'], true, true),
('Compactador de Solo Vibratorio', 'Compactador para preparação de terrenos', 'Compactadores', 200.00, 1200.00, 4800.00, ARRAY['1.5 toneladas', 'Vibração dupla', 'Motor diesel'], true, false),
('Retroescavadeira JCB 3CX', 'Máquina versátil para escavação e carregamento', 'Retroescavadeiras', 380.00, 2280.00, 9120.00, ARRAY['8 toneladas', 'Motor 109HP', 'Tração 4x4'], true, true),
('Martelo Pneumático', 'Martelo para demolição e quebra de concreto', 'Ferramentas', 80.00, 480.00, 1920.00, ARRAY['Peso 25kg', 'Pressão 7 bar', 'Ponteiros inclusos'], true, false)
ON CONFLICT DO NOTHING;

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Adicionar DROP TRIGGER IF EXISTS para evitar erro "trigger already exists"
DROP TRIGGER IF EXISTS update_produtos_catalogo_updated_at ON public.produtos_catalogo;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_produtos_catalogo_updated_at 
    BEFORE UPDATE ON public.produtos_catalogo 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
