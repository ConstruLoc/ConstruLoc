-- Add photo field to contracts table
ALTER TABLE contratos
ADD COLUMN IF NOT EXISTS foto_contrato TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN contratos.foto_contrato IS 'Base64 encoded image of the physical contract document';
