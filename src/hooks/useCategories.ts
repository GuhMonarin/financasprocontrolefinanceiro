import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { checkRateLimit, RATE_LIMITS, RateLimitError } from '@/lib/rateLimiter';
import { handleDatabaseError, logError } from '@/lib/errorHandler';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  is_default: boolean;
  created_at: string;
}

export function useCategories() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['categories', user?.id],
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
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'is_default'>) => {
      if (!user) throw new Error('User not authenticated');

      // Check rate limit for DB writes - use user ID
      checkRateLimit(user.id, 'db-write', RATE_LIMITS.DB_WRITE);
      
      const { data, error } = await supabase
        .from('categories')
        .insert({
          ...category,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria criada!');
    },
    onError: (error) => {
      if (error instanceof RateLimitError) {
        toast.error(error.message);
      } else {
        const message = handleDatabaseError(error, 'save');
        logError(error, 'useCreateCategory');
        toast.error(message);
      }
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Category> & { id: string }) => {
      if (!user) throw new Error('User not authenticated');
      // Check rate limit for DB writes - use user ID
      checkRateLimit(user.id, 'db-write', RATE_LIMITS.DB_WRITE);

      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria atualizada!');
    },
    onError: (error) => {
      if (error instanceof RateLimitError) {
        toast.error(error.message);
      } else {
        const message = handleDatabaseError(error, 'update');
        logError(error, 'useUpdateCategory');
        toast.error(message);
      }
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated');
      // Check rate limit for DB writes - use user ID
      checkRateLimit(user.id, 'db-write', RATE_LIMITS.DB_WRITE);

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Categoria excluída!');
    },
    onError: (error) => {
      if (error instanceof RateLimitError) {
        toast.error(error.message);
      } else {
        const message = handleDatabaseError(error, 'delete');
        logError(error, 'useDeleteCategory');
        toast.error(message);
      }
    },
  });
}
