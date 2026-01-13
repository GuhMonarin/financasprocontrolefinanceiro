import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction } from './useTransactions';
import { checkRateLimit, RATE_LIMITS, RateLimitError } from '@/lib/rateLimiter';
import { toast } from 'sonner';

export interface MonthData {
  month: number;
  year: number;
  label: string;
  income: number;
  expense: number;
  balance: number;
  transactions: Transaction[];
  categoryBreakdown: {
    expense: Record<string, { name: string; value: number; color: string }>;
    income: Record<string, { name: string; value: number; color: string }>;
  };
}

const monthLabels = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export function useTransactionsMultiMonth(months: { month: number; year: number }[]) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transactions-multi', user?.id, months],
    queryFn: async () => {
      if (!user || months.length === 0) return [];

      try {
        checkRateLimit(user.id, 'db-read', RATE_LIMITS.DB_READ);
      } catch (error) {
        if (error instanceof RateLimitError) {
          toast.error(error.message);
          throw error;
        }
        throw error;
      }

      // Build date ranges for all months
      const dateRanges = months.map(({ month, year }) => {
        const startDate = new Date(year, month, 1).toISOString().split('T')[0];
        const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
        return { month, year, startDate, endDate };
      });

      // Get min and max dates for query
      const minDate = dateRanges.reduce((min, r) => r.startDate < min ? r.startDate : min, dateRanges[0].startDate);
      const maxDate = dateRanges.reduce((max, r) => r.endDate > max ? r.endDate : max, dateRanges[0].endDate);

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('user_id', user.id)
        .gte('date', minDate)
        .lte('date', maxDate)
        .order('date', { ascending: false });

      if (error) throw error;

      const transactions = data as Transaction[];

      // Group transactions by month/year
      const result: MonthData[] = dateRanges.map(({ month, year, startDate, endDate }) => {
        const monthTransactions = transactions.filter(t => {
          return t.date >= startDate && t.date <= endDate;
        });

        const income = monthTransactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        const expense = monthTransactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);

        // Category breakdown
        const expenseByCategory = monthTransactions
          .filter(t => t.type === 'expense' && t.category)
          .reduce((acc, t) => {
            const name = t.category!.name;
            if (!acc[name]) {
              acc[name] = { name, value: 0, color: t.category!.color };
            }
            acc[name].value += Number(t.amount);
            return acc;
          }, {} as Record<string, { name: string; value: number; color: string }>);

        const incomeByCategory = monthTransactions
          .filter(t => t.type === 'income' && t.category)
          .reduce((acc, t) => {
            const name = t.category!.name;
            if (!acc[name]) {
              acc[name] = { name, value: 0, color: t.category!.color };
            }
            acc[name].value += Number(t.amount);
            return acc;
          }, {} as Record<string, { name: string; value: number; color: string }>);

        return {
          month,
          year,
          label: `${monthLabels[month]}/${year}`,
          income,
          expense,
          balance: income - expense,
          transactions: monthTransactions,
          categoryBreakdown: {
            expense: expenseByCategory,
            income: incomeByCategory,
          },
        };
      });

      return result;
    },
    enabled: !!user && months.length > 0,
    staleTime: 30000, // 30 seconds for performance
  });
}

// Export data structure for reports
export interface ExportReportData {
  generatedAt: string;
  period: {
    start: { month: number; year: number };
    end: { month: number; year: number };
  };
  summary: {
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    averageMonthlyIncome: number;
    averageMonthlyExpense: number;
  };
  monthlyData: Array<{
    month: string;
    income: number;
    expense: number;
    balance: number;
    topExpenseCategories: Array<{ name: string; value: number; percentage: number }>;
    topIncomeCategories: Array<{ name: string; value: number; percentage: number }>;
  }>;
  trends: {
    incomeChange: number;
    expenseChange: number;
    balanceChange: number;
    direction: 'improving' | 'declining' | 'stable';
  };
  categoryTotals: {
    expense: Array<{ name: string; total: number; average: number; color: string }>;
    income: Array<{ name: string; total: number; average: number; color: string }>;
  };
}

export function generateExportData(monthsData: MonthData[]): ExportReportData {
  if (monthsData.length === 0) {
    return {
      generatedAt: new Date().toISOString(),
      period: { start: { month: 0, year: 2024 }, end: { month: 0, year: 2024 } },
      summary: {
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0,
        averageMonthlyIncome: 0,
        averageMonthlyExpense: 0,
      },
      monthlyData: [],
      trends: { incomeChange: 0, expenseChange: 0, balanceChange: 0, direction: 'stable' },
      categoryTotals: { expense: [], income: [] },
    };
  }

  const sorted = [...monthsData].sort((a, b) => 
    a.year !== b.year ? a.year - b.year : a.month - b.month
  );

  const totalIncome = sorted.reduce((sum, m) => sum + m.income, 0);
  const totalExpense = sorted.reduce((sum, m) => sum + m.expense, 0);
  const monthCount = sorted.length;

  // Aggregate category totals
  const expenseCategoryTotals: Record<string, { name: string; total: number; color: string }> = {};
  const incomeCategoryTotals: Record<string, { name: string; total: number; color: string }> = {};

  sorted.forEach(m => {
    Object.values(m.categoryBreakdown.expense).forEach(cat => {
      if (!expenseCategoryTotals[cat.name]) {
        expenseCategoryTotals[cat.name] = { name: cat.name, total: 0, color: cat.color };
      }
      expenseCategoryTotals[cat.name].total += cat.value;
    });
    Object.values(m.categoryBreakdown.income).forEach(cat => {
      if (!incomeCategoryTotals[cat.name]) {
        incomeCategoryTotals[cat.name] = { name: cat.name, total: 0, color: cat.color };
      }
      incomeCategoryTotals[cat.name].total += cat.value;
    });
  });

  // Calculate trends (last month vs first month)
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const incomeChange = first.income > 0 ? ((last.income - first.income) / first.income) * 100 : 0;
  const expenseChange = first.expense > 0 ? ((last.expense - first.expense) / first.expense) * 100 : 0;
  const balanceChange = last.balance - first.balance;

  let direction: 'improving' | 'declining' | 'stable' = 'stable';
  if (balanceChange > 0 && incomeChange > expenseChange) direction = 'improving';
  else if (balanceChange < 0 || expenseChange > incomeChange + 10) direction = 'declining';

  return {
    generatedAt: new Date().toISOString(),
    period: {
      start: { month: first.month, year: first.year },
      end: { month: last.month, year: last.year },
    },
    summary: {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      averageMonthlyIncome: totalIncome / monthCount,
      averageMonthlyExpense: totalExpense / monthCount,
    },
    monthlyData: sorted.map(m => ({
      month: m.label,
      income: m.income,
      expense: m.expense,
      balance: m.balance,
      topExpenseCategories: Object.values(m.categoryBreakdown.expense)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
        .map(c => ({
          name: c.name,
          value: c.value,
          percentage: m.expense > 0 ? (c.value / m.expense) * 100 : 0,
        })),
      topIncomeCategories: Object.values(m.categoryBreakdown.income)
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)
        .map(c => ({
          name: c.name,
          value: c.value,
          percentage: m.income > 0 ? (c.value / m.income) * 100 : 0,
        })),
    })),
    trends: {
      incomeChange,
      expenseChange,
      balanceChange,
      direction,
    },
    categoryTotals: {
      expense: Object.values(expenseCategoryTotals)
        .map(c => ({ ...c, average: c.total / monthCount }))
        .sort((a, b) => b.total - a.total),
      income: Object.values(incomeCategoryTotals)
        .map(c => ({ ...c, average: c.total / monthCount }))
        .sort((a, b) => b.total - a.total),
    },
  };
}
