-- Add icon and color columns to categorias_equipamentos table
ALTER TABLE categorias_equipamentos
ADD COLUMN IF NOT EXISTS icone VARCHAR(10),
ADD COLUMN IF NOT EXISTS cor VARCHAR(50);

-- Update existing categories with default values if they don't have them
UPDATE categorias_equipamentos
SET icone = '📦'
WHERE icone IS NULL;

UPDATE categorias_equipamentos
SET cor = 'bg-blue-500'
WHERE cor IS NULL;
