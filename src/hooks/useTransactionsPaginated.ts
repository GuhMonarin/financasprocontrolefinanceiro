import { useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction } from './useTransactions';
import { checkRateLimit, RATE_LIMITS, RateLimitError } from '@/lib/rateLimiter';
import { toast } from 'sonner';

const PAGE_SIZE = 20;

interface TransactionPage {
  data: Transaction[];
  nextCursor: number | null;
  totalCount: number;
}

export function useTransactionsPaginated(filters?: {
  month?: number;
  year?: number;
  type?: 'income' | 'expense' | 'all';
  categoryId?: string;
  search?: string;
}) {
  const { user } = useAuth();

  return useInfiniteQuery({
    queryKey: ['transactions-paginated', user?.id, filters],
    queryFn: async ({ pageParam = 0 }): Promise<TransactionPage> => {
      if (!user) return { data: [], nextCursor: null, totalCount: 0 };

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
        `, { count: 'exact' })
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + PAGE_SIZE - 1);

      // Apply filters
      if (filters?.month !== undefined && filters?.year !== undefined) {
        const startDate = new Date(filters.year, filters.month, 1).toISOString().split('T')[0];
        const endDate = new Date(filters.year, filters.month + 1, 0).toISOString().split('T')[0];
        query = query.gte('date', startDate).lte('date', endDate);
      }

      if (filters?.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      if (filters?.categoryId && filters.categoryId !== 'all') {
        query = query.eq('category_id', filters.categoryId);
      }

      if (filters?.search) {
        query = query.ilike('description', `%${filters.search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const hasMore = data && count ? pageParam + data.length < count : false;

      return {
        data: data as Transaction[],
        nextCursor: hasMore ? pageParam + PAGE_SIZE : null,
        totalCount: count || 0,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection)
  });
}
