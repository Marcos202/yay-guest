-- Criar tabela de convidados
CREATE TABLE public.convidados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo VARCHAR(255) NOT NULL,
  idade INT NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  data_confirmacao TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Habilitar RLS (dados públicos para permitir inserção sem autenticação)
ALTER TABLE public.convidados ENABLE ROW LEVEL SECURITY;

-- Policy para permitir inserção pública (qualquer um pode confirmar presença)
CREATE POLICY "Qualquer um pode confirmar presença"
ON public.convidados
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy para admins poderem visualizar todos os convidados
CREATE POLICY "Admins podem visualizar convidados"
ON public.convidados
FOR SELECT
TO authenticated
USING (true);

-- Criar tabela de perfis de admin
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy para usuários verem seu próprio perfil
CREATE POLICY "Usuários podem ver próprio perfil"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$;

-- Trigger para criar perfil quando usuário se registra
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Habilitar realtime para convidados (para atualizar dashboard em tempo real)
ALTER TABLE public.convidados REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.convidados;