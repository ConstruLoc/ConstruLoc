-- Create monthly_payments table to track individual month payments for contracts
CREATE TABLE IF NOT EXISTS public.pagamentos_mensais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contrato_id UUID NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL, -- Month number (1-12)
  ano INTEGER NOT NULL, -- Year (2025, 2026, etc)
  mes_referencia TEXT NOT NULL, -- Display format like "out/2025"
  valor NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado')),
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contrato_id, mes, ano)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pagamentos_mensais_contrato ON public.pagamentos_mensais(contrato_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_mensais_status ON public.pagamentos_mensais(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_mensais_vencimento ON public.pagamentos_mensais(data_vencimento);

-- Add RLS policies
ALTER TABLE public.pagamentos_mensais ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all monthly payments
CREATE POLICY "Users can view monthly payments" ON public.pagamentos_mensais
  FOR SELECT USING (true);

-- Policy: Users can insert monthly payments
CREATE POLICY "Users can insert monthly payments" ON public.pagamentos_mensais
  FOR INSERT WITH CHECK (true);

-- Policy: Users can update monthly payments
CREATE POLICY "Users can update monthly payments" ON public.pagamentos_mensais
  FOR UPDATE USING (true);

-- Policy: Users can delete monthly payments
CREATE POLICY "Users can delete monthly payments" ON public.pagamentos_mensais
  FOR DELETE USING (true);
