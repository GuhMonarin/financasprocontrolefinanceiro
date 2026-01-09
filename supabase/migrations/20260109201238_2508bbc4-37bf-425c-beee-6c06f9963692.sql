-- Habilitar RLS na tabela subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Permitir que todos possam ver os planos (são públicos)
CREATE POLICY "Anyone can view subscription plans"
ON public.subscription_plans
FOR SELECT
USING (true);

-- Apenas admins podem inserir/atualizar/deletar planos (via service role)
-- Usuários normais não podem modificar planos