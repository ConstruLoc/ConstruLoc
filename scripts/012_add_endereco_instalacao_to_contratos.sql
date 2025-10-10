-- Add endereco_instalacao column to contratos table
ALTER TABLE public.contratos
ADD COLUMN IF NOT EXISTS endereco_instalacao TEXT;

-- Add comment to the column
COMMENT ON COLUMN public.contratos.endereco_instalacao IS 'Endereço onde o equipamento será instalado/utilizado';
