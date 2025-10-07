-- Fix contract number generation to use format with hyphen (CL-0001, CL-0002, etc.)

-- Drop the old function
DROP FUNCTION IF EXISTS public.generate_contract_number();

-- Updated to use hyphen format (CL-0001)
CREATE OR REPLACE FUNCTION public.generate_contract_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  max_num INTEGER;
  new_num INTEGER;
  contract_number TEXT;
BEGIN
  -- Find the highest number from all existing contracts
  -- Extract numbers from various formats (CL250001, CL2500, CL-0001, etc.)
  SELECT COALESCE(
    MAX(
      CASE 
        -- Extract digits after CL or CL-, taking the last 4 digits
        WHEN numero_contrato ~ '^CL-?\d+$' THEN 
          CAST(RIGHT(REGEXP_REPLACE(numero_contrato, '[^0-9]', '', 'g'), 4) AS INTEGER)
        ELSE 0
      END
    ), 
    0
  )
  INTO max_num
  FROM contratos;
  
  -- Increment to get the next number
  new_num := max_num + 1;
  
  -- Format as CL- + 4-digit padded number (CL-0001, CL-0002, etc.)
  contract_number := 'CL-' || LPAD(new_num::TEXT, 4, '0');
  
  -- Check if this number already exists (safety check)
  WHILE EXISTS (SELECT 1 FROM contratos WHERE numero_contrato = contract_number) LOOP
    new_num := new_num + 1;
    contract_number := 'CL-' || LPAD(new_num::TEXT, 4, '0');
  END LOOP;
  
  RETURN contract_number;
END;
$$;

-- Test the function
SELECT public.generate_contract_number();
