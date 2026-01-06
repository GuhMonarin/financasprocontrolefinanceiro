import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function MonthlyChart() {
  // Fetch transactions for last 6 months
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions-monthly-chart'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      // Get transactions from last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', sixMonthsAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
  });

  const monthlyData = useMemo(() => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const now = new Date();
    const months: { month: string; income: number; expense: number }[] = [];
    
    // Create last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: monthNames[date.getMonth()],
        income: 0,
        expense: 0,
      });
    }
    
    // Aggregate transactions by month
    transactions.forEach((t) => {
      const transactionDate = new Date(t.date);
      const monthDiff = (now.getFullYear() - transactionDate.getFullYear()) * 12 + (now.getMonth() - transactionDate.getMonth());
      
      if (monthDiff >= 0 && monthDiff < 6) {
        const index = 5 - monthDiff;
        if (t.type === 'income') {
          months[index].income += Number(t.amount);
        } else {
          months[index].expense += Number(t.amount);
        }
      }
    });
    
    return months;
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-4 rounded-lg shadow-lg border border-border">
          <p className="font-semibold mb-2">{label}</p>
          <div className="space-y-1">
            <p className="text-sm flex justify-between gap-4">
              <span className="text-income">Receitas:</span>
              <span className="font-medium">{formatCurrency(payload[0].value)}</span>
            </p>
            <p className="text-sm flex justify-between gap-4">
              <span className="text-expense">Despesas:</span>
              <span className="font-medium">{formatCurrency(payload[1].value)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl p-6 card-shadow animate-in">
        <h3 className="text-lg font-semibold mb-4">Evolução Mensal</h3>
        <div className="h-[280px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 card-shadow animate-in">
      <h3 className="text-lg font-semibold mb-4">Evolução Mensal</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="income"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorIncome)"
            />
            <Area
              type="monotone"
              dataKey="expense"
              stroke="hsl(0, 72%, 51%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorExpense)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-income" />
          <span className="text-sm text-muted-foreground">Receitas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-expense" />
          <span className="text-sm text-muted-foreground">Despesas</span>
        </div>
      </div>
    </div>
  );
}
