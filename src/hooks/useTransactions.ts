import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Category } from './useCategories';
import { checkRateLimit, RATE_LIMITS, RateLimitError } from '@/lib/rateLimiter';
import { handleDatabaseError, logError } from '@/lib/errorHandler';

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  description: string;
  date: string;
  type: 'income' | 'expense';
  created_at: string;
  updated_at: string;
  is_recurring: boolean;
  recurrence_type: 'fixed' | 'installment' | null;
  installment_count: number | null;
  current_installment: number | null;
  recurring_group_id: string | null;
  category?: Category | null;
}

export function useTransactions(month?: number, year?: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transactions', user?.id, month, year],
    queryFn: async () => {
      if (!user) return [];

      // Check rate limit for DB reads - use user ID
      try {
        checkRateLimit(user.id, 'db-read', RATE_LIMITS.DB_READ);
      } catch (error) {
        if (error instanceof RateLimitError) {
          toast.error(error.message);
          throw error;
        }
        throw error;
      }
      
      let query = supabase
        .from('transactions')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (month !== undefined && year !== undefined) {
        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
        query = query.gte('date', startDate).lte('date', endDate);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (transaction: {
      category_id: string;
      amount: number;
      description: string;
      date: string;
      type: 'income' | 'expense';
      is_recurring?: boolean;
      recurrence_type?: 'fixed' | 'installment' | null;
      installment_count?: number | null;
      fixed_frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly' | null;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Check rate limit for DB writes - use user ID
      checkRateLimit(user.id, 'db-write', RATE_LIMITS.DB_WRITE);
      
      const { is_recurring, recurrence_type, installment_count, fixed_frequency, ...baseTransaction } = transaction;
      
      // If it's a recurring transaction with installments, create multiple transactions
      if (is_recurring && recurrence_type === 'installment' && installment_count) {
        const recurringGroupId = crypto.randomUUID();
        const transactions = [];
        const baseDate = new Date(transaction.date);
        
        for (let i = 0; i < installment_count; i++) {
          const installmentDate = new Date(baseDate);
          installmentDate.setMonth(baseDate.getMonth() + i);
          
          transactions.push({
            ...baseTransaction,
            user_id: user.id,
            is_recurring: true,
            recurrence_type: 'installment' as const,
            installment_count,
            current_installment: i + 1,
            recurring_group_id: recurringGroupId,
            date: installmentDate.toISOString().split('T')[0],
            description: `${transaction.description} (${i + 1}/${installment_count})`,
          });
        }
        
        const { data, error } = await supabase
          .from('transactions')
          .insert(transactions)
          .select();
        
        if (error) throw error;
        return data;
      }
      
      // If it's a fixed recurring transaction, create transactions based on frequency
      if (is_recurring && recurrence_type === 'fixed') {
        const recurringGroupId = crypto.randomUUID();
        const transactions = [];
        const baseDate = new Date(transaction.date);
        const frequency = fixed_frequency || 'monthly';
        
        // Define how many occurrences to create based on frequency
        const occurrencesMap = {
          daily: 30,    // 30 days
          weekly: 12,   // 12 weeks
          monthly: 12,  // 12 months
          yearly: 3,    // 3 years
        };
        const occurrences = occurrencesMap[frequency];
        
        for (let i = 0; i < occurrences; i++) {
          const transactionDate = new Date(baseDate);
          
          switch (frequency) {
            case 'daily':
              transactionDate.setDate(baseDate.getDate() + i);
              break;
            case 'weekly':
              transactionDate.setDate(baseDate.getDate() + (i * 7));
              break;
            case 'monthly':
              transactionDate.setMonth(baseDate.getMonth() + i);
              break;
            case 'yearly':
              transactionDate.setFullYear(baseDate.getFullYear() + i);
              break;
          }
          
          transactions.push({
            ...baseTransaction,
            user_id: user.id,
            is_recurring: true,
            recurrence_type: 'fixed' as const,
            recurring_group_id: recurringGroupId,
            date: transactionDate.toISOString().split('T')[0],
          });
        }
        
        const { data, error } = await supabase
          .from('transactions')
          .insert(transactions)
          .select();
        
        if (error) throw error;
        
        const frequencyLabels = {
          daily: `${occurrences} dias`,
          weekly: `${occurrences} semanas`,
          monthly: `${occurrences} meses`,
          yearly: `${occurrences} anos`,
        };
        toast.success(`Transação fixa criada para os próximos ${frequencyLabels[frequency]}!`);
        return data;
      }
      
      // Regular transaction
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...baseTransaction,
          user_id: user.id,
          is_recurring: false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      if (variables.is_recurring && variables.recurrence_type === 'installment') {
        toast.success(`${variables.installment_count} parcelas criadas!`);
      } else {
        toast.success('Transação adicionada!');
      }
    },
    onError: (error) => {
      if (error instanceof RateLimitError) {
        toast.error(error.message);
      } else {
        const message = handleDatabaseError(error, 'save');
        logError(error, 'useCreateTransaction');
        toast.error(message);
      }
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Transaction> & { id: string }) => {
      if (!user) throw new Error('User not authenticated');
      // Check rate limit for DB writes - use user ID
      checkRateLimit(user.id, 'db-write', RATE_LIMITS.DB_WRITE);

      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transação atualizada!');
    },
    onError: (error) => {
      if (error instanceof RateLimitError) {
        toast.error(error.message);
      } else {
        const message = handleDatabaseError(error, 'update');
        logError(error, 'useUpdateTransaction');
        toast.error(message);
      }
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      // Check rate limit for DB writes - use user ID
      checkRateLimit(user.id, 'db-write', RATE_LIMITS.DB_WRITE);

      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success('Transação excluída!');
    },
    onError: (error) => {
      if (error instanceof RateLimitError) {
        toast.error(error.message);
      } else {
        const message = handleDatabaseError(error, 'delete');
        logError(error, 'useDeleteTransaction');
        toast.error(message);
      }
    },
  });
}
