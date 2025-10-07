-- Criar tabela de contador de contratos se não existir
CREATE TABLE IF NOT EXISTS contract_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  current_number INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Inserir registro inicial se não existir
INSERT INTO contract_counter (id, current_number)
VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- Buscar o maior número de contrato existente (tanto em contratos ativos quanto excluídos)
DO $$
DECLARE
  max_contract_number INTEGER := 0;
  contract_num TEXT;
  num_part TEXT;
BEGIN
  -- Buscar o maior número de contratos ativos
  SELECT numero_contrato INTO contract_num
  FROM contratos
  ORDER BY numero_contrato DESC
  LIMIT 1;
  
  IF contract_num IS NOT NULL THEN
    -- Extrair apenas os dígitos do número do contrato
    num_part := regexp_replace(contract_num, '[^0-9]', '', 'g');
    IF num_part != '' THEN
      max_contract_number := GREATEST(max_contract_number, CAST(num_part AS INTEGER));
    END IF;
  END IF;
  
  -- Buscar o maior número de contratos excluídos (na tabela de pagamentos)
  SELECT contrato_numero INTO contract_num
  FROM pagamentos
  WHERE contrato_excluido = true AND contrato_numero IS NOT NULL
  ORDER BY contrato_numero DESC
  LIMIT 1;
  
  IF contract_num IS NOT NULL THEN
    -- Extrair apenas os dígitos do número do contrato
    num_part := regexp_replace(contract_num, '[^0-9]', '', 'g');
    IF num_part != '' THEN
      max_contract_number := GREATEST(max_contract_number, CAST(num_part AS INTEGER));
    END IF;
  END IF;
  
  -- Atualizar o contador com o maior número encontrado
  UPDATE contract_counter
  SET current_number = max_contract_number,
      updated_at = NOW()
  WHERE id = 1;
END $$;

-- Criar função para obter o próximo número de contrato
CREATE OR REPLACE FUNCTION get_next_contract_number()
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  formatted_num TEXT;
BEGIN
  -- Incrementar e obter o próximo número
  UPDATE contract_counter
  SET current_number = current_number + 1,
      updated_at = NOW()
  WHERE id = 1
  RETURNING current_number INTO next_num;
  
  -- Formatar como CL-0001, CL-0002, etc.
  formatted_num := 'CL-' || LPAD(next_num::TEXT, 4, '0');
  
  RETURN formatted_num;
END;
$$ LANGUAGE plpgsql;

-- Criar função para resetar o contador
CREATE OR REPLACE FUNCTION reset_contract_counter()
RETURNS VOID AS $$
BEGIN
  -- Só permite resetar se não houver contratos no sistema
  IF EXISTS (SELECT 1 FROM contratos LIMIT 1) THEN
    RAISE EXCEPTION 'Não é possível resetar o contador enquanto houver contratos no sistema';
  END IF;
  
  -- Resetar o contador para 0
  UPDATE contract_counter
  SET current_number = 0,
      updated_at = NOW()
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql;
