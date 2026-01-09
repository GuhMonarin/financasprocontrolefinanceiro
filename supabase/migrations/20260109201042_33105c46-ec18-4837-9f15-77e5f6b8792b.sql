-- Tabela de Planos
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly_cents INTEGER,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Subscrições do Usuário
CREATE TABLE public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
ON public.user_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
ON public.user_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

-- Insert planos padrão
INSERT INTO public.subscription_plans (name, description, price_monthly_cents, features)
VALUES 
  ('Free', 'Plano básico gratuito', 0, '{"categories": 5, "export": false, "budgets": false, "mobile": false}'),
  ('Premium', 'Plano premium com tudo', 2990, '{"categories": "unlimited", "export": true, "budgets": true, "mobile": true}');

-- Atualizar função handle_new_user para atribuir plano Free automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  
  -- Create default expense categories
  INSERT INTO public.categories (user_id, name, icon, color, type, is_default) VALUES
    (NEW.id, 'Alimentação', 'utensils', 'hsl(38, 92%, 50%)', 'expense', true),
    (NEW.id, 'Aluguel', 'home', 'hsl(200, 70%, 50%)', 'expense', true),
    (NEW.id, 'Transporte', 'car', 'hsl(280, 65%, 60%)', 'expense', true),
    (NEW.id, 'Lazer', 'gamepad-2', 'hsl(340, 75%, 55%)', 'expense', true),
    (NEW.id, 'Saúde', 'heart-pulse', 'hsl(0, 72%, 51%)', 'expense', true),
    (NEW.id, 'Educação', 'graduation-cap', 'hsl(160, 60%, 35%)', 'expense', true),
    (NEW.id, 'Outros', 'more-horizontal', 'hsl(160, 15%, 45%)', 'expense', true);
  
  -- Create default income categories
  INSERT INTO public.categories (user_id, name, icon, color, type, is_default) VALUES
    (NEW.id, 'Salário', 'banknote', 'hsl(142, 76%, 36%)', 'income', true),
    (NEW.id, 'Freelance', 'laptop', 'hsl(160, 55%, 45%)', 'income', true),
    (NEW.id, 'Investimentos', 'trending-up', 'hsl(200, 70%, 50%)', 'income', true);

  -- Assign Free plan to new user
  INSERT INTO public.user_subscriptions (user_id, plan_id, status)
  VALUES (
    NEW.id,
    (SELECT id FROM public.subscription_plans WHERE name = 'Free'),
    'active'
  );
  
  RETURN NEW;
END;
$function$;