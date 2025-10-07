-- Utility functions for ConstruLoc system

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nome', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'cliente')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to generate contract number
CREATE OR REPLACE FUNCTION public.generate_contract_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  year_suffix TEXT;
  sequence_num INTEGER;
  contract_number TEXT;
BEGIN
  year_suffix := TO_CHAR(NOW(), 'YY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(numero_contrato FROM 4 FOR 4) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM contratos
  WHERE numero_contrato LIKE 'CL' || year_suffix || '%';
  
  contract_number := 'CL' || year_suffix || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN contract_number;
END;
$$;

-- Function to calculate contract total value
CREATE OR REPLACE FUNCTION public.calculate_contract_total(contract_id UUID)
RETURNS DECIMAL(10,2)
LANGUAGE plpgsql
AS $$
DECLARE
  total DECIMAL(10,2) := 0;
BEGIN
  SELECT COALESCE(SUM(valor_total), 0)
  INTO total
  FROM itens_contrato
  WHERE contrato_id = contract_id;
  
  RETURN total;
END;
$$;

-- Function to check equipment availability
CREATE OR REPLACE FUNCTION public.check_equipment_availability(
  equipment_id UUID,
  start_date DATE,
  end_date DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  is_available BOOLEAN := TRUE;
BEGIN
  -- Check if equipment exists and is available
  IF NOT EXISTS (
    SELECT 1 FROM equipamentos 
    WHERE id = equipment_id AND status = 'disponivel'
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Check for conflicting contracts
  IF EXISTS (
    SELECT 1 
    FROM itens_contrato ic
    JOIN contratos c ON ic.contrato_id = c.id
    WHERE ic.equipamento_id = equipment_id
    AND c.status = 'ativo'
    AND (
      (start_date BETWEEN c.data_inicio AND c.data_fim) OR
      (end_date BETWEEN c.data_inicio AND c.data_fim) OR
      (c.data_inicio BETWEEN start_date AND end_date)
    )
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- Check availability calendar
  IF EXISTS (
    SELECT 1 
    FROM disponibilidade_equipamentos
    WHERE equipamento_id = equipment_id
    AND disponivel = FALSE
    AND (
      (start_date BETWEEN data_inicio AND data_fim) OR
      (end_date BETWEEN data_inicio AND data_fim) OR
      (data_inicio BETWEEN start_date AND end_date)
    )
  ) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;
