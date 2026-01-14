import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useMemo, useEffect, useState } from 'react';

interface MonthlyTotals {
  income: number;
  expense: number;
  balance: number;
}

interface TrendData {
  currentMonth: MonthlyTotals;
  previousMonth: MonthlyTotals;
  twoMonthsAgo: MonthlyTotals;
  incomeTrend: number;
  expenseTrend: number;
  balanceTrend: number;
}

interface DashboardData {
  totalBalance: number;
  currentMonthIncome: number;
  currentMonthExpense: number;
  trends: TrendData;
  isLoading: boolean;
}

export function useDashboardData(): DashboardData {
  const { user } = useAuth();
  const [realtimeBalance, setRealtimeBalance] = useState<number | null>(null);

  // Fetch all transactions for the last 3 months
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['dashboard-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 2);
      threeMonthsAgo.setDate(1);

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', threeMonthsAgo.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 30000, // 30 seconds
  });

  // Fetch ALL transactions for total balance
  const { data: allTransactions = [] } = useQuery({
    queryKey: ['all-transactions-balance', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('transactions')
        .select('type, amount')
        .eq('user_id', user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 30000,
  });

  // Subscribe to realtime updates for transactions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('dashboard-balance')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          // Trigger refetch when transaction changes
          setRealtimeBalance(null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Calculate total balance from all transactions
  const totalBalance = useMemo(() => {
    if (realtimeBalance !== null) return realtimeBalance;
    
    return allTransactions.reduce((acc, t) => {
      const amount = Number(t.amount);
      return t.type === 'income' ? acc + amount : acc - amount;
    }, 0);
  }, [allTransactions, realtimeBalance]);

  // Calculate monthly data and trends
  const { trends, currentMonthIncome, currentMonthExpense } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const getMonthTotals = (month: number, year: number): MonthlyTotals => {
      const monthTransactions = transactions.filter((t) => {
        const date = new Date(t.date);
        return date.getMonth() === month && date.getFullYear() === year;
      });

      const income = monthTransactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      const expense = monthTransactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0);

      return { income, expense, balance: income - expense };
    };

    const current = getMonthTotals(currentMonth, currentYear);
    
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    const previous = getMonthTotals(prevMonth, prevYear);

    const twoMonthsAgoMonth = prevMonth === 0 ? 11 : prevMonth - 1;
    const twoMonthsAgoYear = prevMonth === 0 ? prevYear - 1 : prevYear;
    const twoMonthsAgo = getMonthTotals(twoMonthsAgoMonth, twoMonthsAgoYear);

    // Calculate percentage trends (vs previous month)
    const calculateTrend = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      currentMonthIncome: current.income,
      currentMonthExpense: current.expense,
      trends: {
        currentMonth: current,
        previousMonth: previous,
        twoMonthsAgo,
        incomeTrend: calculateTrend(current.income, previous.income),
        expenseTrend: calculateTrend(current.expense, previous.expense),
        balanceTrend: calculateTrend(current.balance, previous.balance),
      },
    };
  }, [transactions]);

  return {
    totalBalance,
    currentMonthIncome,
    currentMonthExpense,
    trends,
    isLoading,
  };
}

// Quick stats for mini cards
export interface QuickStat {
  label: string;
  value: string;
  trend?: number;
  color: 'income' | 'expense' | 'neutral';
}

export function useQuickStats(): { stats: QuickStat[]; isLoading: boolean } {
  const { totalBalance, currentMonthIncome, currentMonthExpense, trends, isLoading } = useDashboardData();

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const stats: QuickStat[] = [
    {
      label: 'Saldo Total',
      value: formatCurrency(totalBalance),
      color: totalBalance >= 0 ? 'income' : 'expense',
    },
    {
      label: 'Receitas',
      value: formatCurrency(currentMonthIncome),
      trend: Math.round(trends.incomeTrend),
      color: 'income',
    },
    {
      label: 'Despesas',
      value: formatCurrency(currentMonthExpense),
      trend: Math.round(trends.expenseTrend),
      color: 'expense',
    },
  ];

  return { stats, isLoading };
}
