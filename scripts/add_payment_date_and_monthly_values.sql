-- Adicionar campo data_pagamento na tabela contratos
ALTER TABLE public.contratos 
ADD COLUMN IF NOT EXISTS data_pagamento DATE;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.contratos.data_pagamento IS 'Data de vencimento do pagamento do contrato';

-- Atualizar contratos existentes para ter data_pagamento igual a data_fim
UPDATE public.contratos 
SET data_pagamento = data_fim 
WHERE data_pagamento IS NULL;

-- Criar tabela para notificações de pagamento
CREATE TABLE IF NOT EXISTS public.notificacoes_pagamento (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contrato_id UUID REFERENCES contratos(id) ON DELETE CASCADE,
  cliente_telefone VARCHAR(20) NOT NULL,
  data_envio DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'pendente', -- pendente, enviado, erro
  mensagem TEXT,
  erro TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para buscar notificações pendentes
CREATE INDEX IF NOT EXISTS idx_notificacoes_status ON public.notificacoes_pagamento(status, data_envio);

-- Criar função para agendar notificações automaticamente
CREATE OR REPLACE FUNCTION agendar_notificacao_pagamento()
RETURNS TRIGGER AS $$
BEGIN
  -- Agendar notificação 5 dias antes da data de pagamento
  IF NEW.data_pagamento IS NOT NULL THEN
    INSERT INTO public.notificacoes_pagamento (
      contrato_id,
      cliente_telefone,
      data_envio,
      mensagem
    )
    SELECT 
      NEW.id,
      c.telefone,
      NEW.data_pagamento - INTERVAL '5 days',
      'Lembrete: O pagamento do contrato ' || NEW.numero_contrato || ' vence em 5 dias (' || TO_CHAR(NEW.data_pagamento, 'DD/MM/YYYY') || '). Valor: R$ ' || NEW.valor_total::TEXT
    FROM public.clientes c
    WHERE c.id = NEW.cliente_id
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para agendar notificações ao criar/atualizar contrato
DROP TRIGGER IF EXISTS trigger_agendar_notificacao ON public.contratos;
CREATE TRIGGER trigger_agendar_notificacao
  AFTER INSERT OR UPDATE OF data_pagamento
  ON public.contratos
  FOR EACH ROW
  EXECUTE FUNCTION agendar_notificacao_pagamento();

-- Habilitar RLS na tabela de notificações
ALTER TABLE public.notificacoes_pagamento ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notificações
CREATE POLICY "Admin and operators can view notifications" 
  ON public.notificacoes_pagamento FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
  );

CREATE POLICY "Admin and operators can manage notifications" 
  ON public.notificacoes_pagamento FOR ALL 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
  );
