-- Criar função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar tabela de campanhas
CREATE TABLE public.campanhas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome VARCHAR(255) NOT NULL,
  mensagem_template TEXT NOT NULL,
  intervalo_min INTEGER DEFAULT 3000,
  intervalo_max INTEGER DEFAULT 10000,
  taxa_por_minuto INTEGER DEFAULT 60,
  modo VARCHAR(20) NOT NULL CHECK (modo IN ('manual', 'automatico')),
  status VARCHAR(20) DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'ativa', 'pausada', 'concluida', 'cancelada')),
  agendamento TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de contatos
CREATE TABLE public.contatos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campanha_id UUID NOT NULL REFERENCES public.campanhas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  telefone VARCHAR(20) NOT NULL,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de logs de envio
CREATE TABLE public.envios_whatsapp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campanha_id UUID NOT NULL REFERENCES public.campanhas(id) ON DELETE CASCADE,
  contato_id UUID NOT NULL REFERENCES public.contatos(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pendente', 'enviado', 'falhou', 'bloqueado', 'invalido')),
  mensagem_enviada TEXT,
  erro_mensagem TEXT,
  timestamp_envio TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de opt-outs
CREATE TABLE public.optouts_whatsapp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telefone VARCHAR(20) NOT NULL UNIQUE,
  motivo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de sessões WhatsApp
CREATE TABLE public.whatsapp_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  session_data TEXT,
  qr_code TEXT,
  status VARCHAR(20) DEFAULT 'desconectado' CHECK (status IN ('desconectado', 'qr_pendente', 'conectado')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.campanhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.envios_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optouts_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies para campanhas
CREATE POLICY "Usuários podem ver suas próprias campanhas"
ON public.campanhas FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias campanhas"
ON public.campanhas FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias campanhas"
ON public.campanhas FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias campanhas"
ON public.campanhas FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies para contatos
CREATE POLICY "Usuários podem ver contatos de suas campanhas"
ON public.contatos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.campanhas
    WHERE campanhas.id = contatos.campanha_id
    AND campanhas.user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem criar contatos em suas campanhas"
ON public.contatos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campanhas
    WHERE campanhas.id = contatos.campanha_id
    AND campanhas.user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem atualizar contatos de suas campanhas"
ON public.contatos FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.campanhas
    WHERE campanhas.id = contatos.campanha_id
    AND campanhas.user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem deletar contatos de suas campanhas"
ON public.contatos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.campanhas
    WHERE campanhas.id = contatos.campanha_id
    AND campanhas.user_id = auth.uid()
  )
);

-- RLS Policies para envios
CREATE POLICY "Usuários podem ver envios de suas campanhas"
ON public.envios_whatsapp FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.campanhas
    WHERE campanhas.id = envios_whatsapp.campanha_id
    AND campanhas.user_id = auth.uid()
  )
);

CREATE POLICY "Usuários podem criar envios em suas campanhas"
ON public.envios_whatsapp FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campanhas
    WHERE campanhas.id = envios_whatsapp.campanha_id
    AND campanhas.user_id = auth.uid()
  )
);

-- RLS Policies para opt-outs
CREATE POLICY "Todos podem ver opt-outs"
ON public.optouts_whatsapp FOR SELECT
USING (true);

CREATE POLICY "Todos podem criar opt-outs"
ON public.optouts_whatsapp FOR INSERT
WITH CHECK (true);

-- RLS Policies para sessões WhatsApp
CREATE POLICY "Usuários podem ver sua própria sessão"
ON public.whatsapp_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar sua própria sessão"
ON public.whatsapp_sessions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar sua própria sessão"
ON public.whatsapp_sessions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar sua própria sessão"
ON public.whatsapp_sessions FOR DELETE
USING (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX idx_contatos_campanha ON public.contatos(campanha_id);
CREATE INDEX idx_envios_campanha ON public.envios_whatsapp(campanha_id);
CREATE INDEX idx_envios_contato ON public.envios_whatsapp(contato_id);
CREATE INDEX idx_optouts_telefone ON public.optouts_whatsapp(telefone);
CREATE INDEX idx_sessions_user ON public.whatsapp_sessions(user_id);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_campanhas_updated_at
BEFORE UPDATE ON public.campanhas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at
BEFORE UPDATE ON public.whatsapp_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();