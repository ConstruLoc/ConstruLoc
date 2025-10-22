-- Adicionar campos de duração e prazo de pagamento aos contratos

-- Adicionar campo de duração do contrato (em meses)
ALTER TABLE public.contratos 
ADD COLUMN IF NOT EXISTS duracao_meses INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS prazo_pagamento_dias INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS endereco_instalacao TEXT;

-- Comentários para documentação
COMMENT ON COLUMN public.contratos.duracao_meses IS 'Duração do contrato em meses (1, 3, 6, 12, etc.)';
COMMENT ON COLUMN public.contratos.prazo_pagamento_dias IS 'Prazo de pagamento em dias (30, 60, 90, etc.)';
COMMENT ON COLUMN public.contratos.endereco_instalacao IS 'Endereço onde o equipamento será instalado';

-- Adicionar campo data_pagamento se não existir
ALTER TABLE public.contratos 
ADD COLUMN IF NOT EXISTS data_pagamento DATE;

COMMENT ON COLUMN public.contratos.data_pagamento IS 'Data de vencimento do pagamento. Notificação enviada 5 dias antes.';

-- Criar tabela de notificações SMS
CREATE TABLE IF NOT EXISTS public.notificacoes_sms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contrato_id UUID REFERENCES contratos(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  mensagem TEXT NOT NULL,
  data_agendamento TIMESTAMP WITH TIME ZONE NOT NULL,
  data_envio TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'pendente', -- pendente, enviado, erro
  erro_mensagem TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_status ON public.notificacoes_sms(status);
CREATE INDEX IF NOT EXISTS idx_notificacoes_agendamento ON public.notificacoes_sms(data_agendamento);
CREATE INDEX IF NOT EXISTS idx_notificacoes_contrato ON public.notificacoes_sms(contrato_id);

-- RLS para notificações
ALTER TABLE public.notificacoes_sms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin and operators can view all notifications" ON public.notificacoes_sms FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
);

CREATE POLICY "Admin and operators can manage notifications" ON public.notificacoes_sms FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'operador'))
);

-- Função para agendar notificação de pagamento
CREATE OR REPLACE FUNCTION agendar_notificacao_pagamento()
RETURNS TRIGGER AS $$
DECLARE
  cliente_telefone VARCHAR(20);
  cliente_nome VARCHAR(255);
  data_notificacao TIMESTAMP WITH TIME ZONE;
  mensagem_texto TEXT;
BEGIN
  -- Buscar telefone do cliente
  SELECT telefone, nome INTO cliente_telefone, cliente_nome
  FROM clientes
  WHERE id = NEW.cliente_id;

  -- Calcular data de notificação (5 dias antes do pagamento)
  data_notificacao := (NEW.data_pagamento - INTERVAL '5 days')::TIMESTAMP WITH TIME ZONE;

  -- Criar mensagem
  mensagem_texto := format(
    'Olá %s! Lembrete: O pagamento do contrato %s vence em 5 dias (%s). Valor: R$ %.2f. ConstruLoc',
    cliente_nome,
    NEW.numero_contrato,
    TO_CHAR(NEW.data_pagamento, 'DD/MM/YYYY'),
    NEW.valor_total
  );

  -- Inserir notificação agendada
  INSERT INTO notificacoes_sms (
    contrato_id,
    cliente_id,
    telefone,
    mensagem,
    data_agendamento,
    status
  ) VALUES (
    NEW.id,
    NEW.cliente_id,
    cliente_telefone,
    mensagem_texto,
    data_notificacao,
    'pendente'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para agendar notificação quando contrato é criado/atualizado
DROP TRIGGER IF EXISTS trigger_agendar_notificacao ON public.contratos;
CREATE TRIGGER trigger_agendar_notificacao
  AFTER INSERT OR UPDATE OF data_pagamento
  ON public.contratos
  FOR EACH ROW
  WHEN (NEW.data_pagamento IS NOT NULL)
  EXECUTE FUNCTION agendar_notificacao_pagamento();
