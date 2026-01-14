-- Create budgets table
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_id, month, year)
);

-- Enable RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own budgets" 
ON public.budgets 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" 
ON public.budgets 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" 
ON public.budgets 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" 
ON public.budgets 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();