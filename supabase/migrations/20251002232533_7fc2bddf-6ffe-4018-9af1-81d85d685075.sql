-- Permitir que o campo whatsapp seja opcional (nullable)
ALTER TABLE public.convidados 
ALTER COLUMN whatsapp DROP NOT NULL;