-- Function to generate sequential contract numbers
CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TEXT AS $$
DECLARE
    current_year INTEGER;
    next_number INTEGER;
    contract_number TEXT;
BEGIN
    -- Get current year
    current_year := EXTRACT(YEAR FROM CURRENT_DATE);
    
    -- Get the next sequential number for this year
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_contrato FROM 3 FOR 6) AS INTEGER)), 0) + 1
    INTO next_number
    FROM contratos
    WHERE numero_contrato LIKE 'CL' || current_year || '%';
    
    -- Format the contract number: CL + YEAR + 6-digit sequential number
    contract_number := 'CL' || current_year || LPAD(next_number::TEXT, 6, '0');
    
    RETURN contract_number;
END;
$$ LANGUAGE plpgsql;
