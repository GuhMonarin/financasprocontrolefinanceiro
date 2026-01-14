import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { checkRateLimit, RateLimitError, RATE_LIMITS } from '@/lib/rateLimiter';
import { handleDatabaseError, logError } from '@/lib/errorHandler';

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: string;
  };
}

export interface BudgetWithSpent extends Budget {
  spent: number;
  percentage: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
}

export function useBudgets(month?: number, year?: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['budgets', user?.id, month, year],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      checkRateLimit(user.id, 'db_read', RATE_LIMITS.DB_READ);

      let query = supabase
        .from('budgets')
        .select(`
          *,
          category:categories(id, name, icon, color, type)
        `)
        .eq('user_id', user.id);

      if (month !== undefined && year !== undefined) {
        query = query.eq('month', month + 1).eq('year', year);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data as Budget[];
    },
    enabled: !!user,
  });
}

export function useBudgetsWithSpent(month: number, year: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['budgets-with-spent', user?.id, month, year],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      checkRateLimit(user.id, 'db_read', RATE_LIMITS.DB_READ);

      // Get budgets for the month
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select(`
          *,
          category:categories(id, name, icon, color, type)
        `)
        .eq('user_id', user.id)
        .eq('month', month + 1)
        .eq('year', year);

      if (budgetsError) throw budgetsError;

      // Get transactions for the month
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate);

      if (transactionsError) throw transactionsError;

      // Calculate spent per category
      const spentByCategory: Record<string, number> = {};
      transactions?.forEach((t) => {
        if (t.category_id) {
          spentByCategory[t.category_id] = (spentByCategory[t.category_id] || 0) + Number(t.amount);
        }
      });

      // Combine budgets with spent amounts
      const budgetsWithSpent: BudgetWithSpent[] = (budgets || []).map((budget) => {
        const spent = spentByCategory[budget.category_id] || 0;
        const percentage = budget.amount > 0 ? (spent / Number(budget.amount)) * 100 : 0;
        return {
          ...budget,
          spent,
          percentage,
          isOverBudget: percentage >= 100,
          isNearLimit: percentage >= 80 && percentage < 100,
        };
      });

      return budgetsWithSpent;
    },
    enabled: !!user,
  });
}

export function useCreateBudget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budget: { category_id: string; amount: number; month: number; year: number }) => {
      if (!user) throw new Error('User not authenticated');

      checkRateLimit(user.id, 'db_write', RATE_LIMITS.DB_WRITE);

      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category_id: budget.category_id,
          amount: budget.amount,
          month: budget.month,
          year: budget.year,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgets-with-spent'] });
      toast.success('Budget criado com sucesso!');
    },
    onError: (error: unknown) => {
      if (error instanceof RateLimitError) {
        toast.error(error.message);
      } else if (error instanceof Error && error.message.includes('duplicate key')) {
        toast.error('Já existe um budget para esta categoria neste mês.');
      } else {
        const message = handleDatabaseError(error, 'save');
        logError(error, 'useCreateBudget');
        toast.error(message);
      }
    },
  });
}

export function useUpdateBudget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      if (!user) throw new Error('User not authenticated');

      checkRateLimit(user.id, 'db_write', RATE_LIMITS.DB_WRITE);

      const { data, error } = await supabase
        .from('budgets')
        .update({ amount })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgets-with-spent'] });
      toast.success('Budget atualizado com sucesso!');
    },
    onError: (error: unknown) => {
      if (error instanceof RateLimitError) {
        toast.error(error.message);
      } else {
        const message = handleDatabaseError(error, 'update');
        logError(error, 'useUpdateBudget');
        toast.error(message);
      }
    },
  });
}

export function useDeleteBudget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');

      checkRateLimit(user.id, 'db_write', RATE_LIMITS.DB_WRITE);

      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgets-with-spent'] });
      toast.success('Budget excluído com sucesso!');
    },
    onError: (error: unknown) => {
      if (error instanceof RateLimitError) {
        toast.error(error.message);
      } else {
        const message = handleDatabaseError(error, 'delete');
        logError(error, 'useDeleteBudget');
        toast.error(message);
      }
    },
  });
}
