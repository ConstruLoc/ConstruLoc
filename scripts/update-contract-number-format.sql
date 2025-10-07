-- Update contract number generation to use simple sequential format (CL0001, CL0002, etc.)
CREATE OR REPLACE FUNCTION public.generate_contract_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  sequence_num INTEGER;
  contract_number TEXT;
BEGIN
  -- Get the next sequence number (without year prefix)
  SELECT COALESCE(MAX(CAST(SUBSTRING(numero_contrato FROM 3) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM contratos
  WHERE numero_contrato ~ '^CL[0-9]+$';
  
  -- Generate contract number in format CL0001, CL0002, etc.
  contract_number := 'CL' || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN contract_number;
END;
$$;
