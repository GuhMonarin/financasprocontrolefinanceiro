ALTER TABLE public.transactions
ADD COLUMN is_paid boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.transactions.is_paid IS 'Indicates whether an expense has been paid; income transactions do not use this status.';