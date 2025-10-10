-- Remove NOT NULL constraint from numero_serie column in equipamentos table
-- This allows multiple equipments to have NULL serial numbers

ALTER TABLE equipamentos 
ALTER COLUMN numero_serie DROP NOT NULL;

-- Add a comment to document the change
COMMENT ON COLUMN equipamentos.numero_serie IS 'Serial number of the equipment (optional, allows NULL)';
