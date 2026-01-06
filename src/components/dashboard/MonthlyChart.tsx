import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockMonthlyData, formatCurrency } from '@/data/mockData';

export function MonthlyChart() {
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

  return (
    <div className="bg-card rounded-2xl p-6 card-shadow animate-in">
      <h3 className="text-lg font-semibold mb-4">Evolução Mensal</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockMonthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
