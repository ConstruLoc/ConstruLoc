-- Fix pagamentos table to allow NULL in contrato_id
-- This allows preserving payment history even after contract deletion

-- Add new columns if they don't exist
ALTER TABLE pagamentos 
ADD COLUMN IF NOT EXISTS contrato_excluido BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS contrato_numero VARCHAR(50);

-- Drop the NOT NULL constraint from contrato_id
ALTER TABLE pagamentos 
ALTER COLUMN contrato_id DROP NOT NULL;

-- Update the foreign key to use ON DELETE SET NULL
ALTER TABLE pagamentos 
DROP CONSTRAINT IF EXISTS pagamentos_contrato_id_fkey;

ALTER TABLE pagamentos 
ADD CONSTRAINT pagamentos_contrato_id_fkey 
FOREIGN KEY (contrato_id) 
REFERENCES contratos(id) 
ON DELETE SET NULL;

-- Create an index for better query performance on deleted contracts
CREATE INDEX IF NOT EXISTS idx_pagamentos_contrato_excluido 
ON pagamentos(contrato_excluido) 
WHERE contrato_excluido = TRUE;
