-- Add "pago" as a valid status for contracts
-- This ensures the database accepts the new "pago" status value

-- Check if the status column has a constraint
DO $$ 
BEGIN
  -- Try to add "pago" to the status enum if it exists
  -- If the column is just a text field, this will be ignored
  IF EXISTS (
    SELECT 1 
    FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'status_contrato'
  ) THEN
    -- Add "pago" to enum if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 
      FROM pg_enum 
      WHERE enumlabel = 'pago' 
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'status_contrato')
    ) THEN
      ALTER TYPE status_contrato ADD VALUE 'pago';
    END IF;
  END IF;
END $$;

-- Update any existing contracts with status "ativo" that should be "pago"
-- (This is optional - only if you want to migrate existing data)
-- UPDATE contratos SET status = 'pago' WHERE status = 'ativo' AND /* your condition */;
