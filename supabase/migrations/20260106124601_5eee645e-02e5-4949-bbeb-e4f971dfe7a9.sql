-- Add recurring/installment fields to transactions
ALTER TABLE public.transactions
ADD COLUMN is_recurring boolean NOT NULL DEFAULT false,
ADD COLUMN recurrence_type text CHECK (recurrence_type IN ('fixed', 'installment')),
ADD COLUMN installment_count integer,
ADD COLUMN current_installment integer,
ADD COLUMN recurring_group_id uuid;