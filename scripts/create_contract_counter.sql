-- Create contract counter table to prevent number reuse
CREATE TABLE IF NOT EXISTS public.contador_contratos (
  id INTEGER PRIMARY KEY DEFAULT 1,
  ultimo_numero INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert initial record
INSERT INTO contador_contratos (id, ultimo_numero) 
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- Update counter based on existing contracts
UPDATE contador_contratos
SET ultimo_numero = (
  SELECT COALESCE(MAX(
    CAST(REGEXP_REPLACE(numero_contrato, '[^0-9]', '', 'g') AS INTEGER)
  ), 0)
  FROM contratos
  WHERE numero_contrato ~ '^CL-?\d+$'
)
WHERE id = 1;

-- Function to generate next contract number using counter
CREATE OR REPLACE FUNCTION public.generate_contract_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_num INTEGER;
  contract_number TEXT;
BEGIN
  -- Increment and get next number atomically
  UPDATE contador_contratos 
  SET ultimo_numero = ultimo_numero + 1,
      updated_at = NOW()
  WHERE id = 1
  RETURNING ultimo_numero INTO next_num;
  
  -- Format as CL-0001
  contract_number := 'CL-' || LPAD(next_num::TEXT, 4, '0');
  
  RETURN contract_number;
END;
$$;

-- Function to reset contract counter
CREATE OR REPLACE FUNCTION public.reset_contract_counter()
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE contador_contratos 
  SET ultimo_numero = 0,
      updated_at = NOW()
  WHERE id = 1;
END;
$$;
