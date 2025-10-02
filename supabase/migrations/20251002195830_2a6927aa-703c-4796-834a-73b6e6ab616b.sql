-- Fix INSERT policy for convidados table to allow both anonymous and authenticated users
DROP POLICY IF EXISTS "Qualquer um pode confirmar presença" ON public.convidados;

CREATE POLICY "Qualquer um pode confirmar presença"
ON public.convidados
FOR INSERT
TO public
WITH CHECK (true);