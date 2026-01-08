import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Transaction } from '@/hooks/useTransactions';

interface ExpenseChartProps {
  transactions: Transaction[];
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function ExpenseChart({ transactions }: ExpenseChartProps) {
  // Calculate expenses by category
  const expensesByCategory = transactions
    .filter(t => t.type === 'expense' && t.category)
    .reduce((acc, t) => {
      const categoryName = t.category!.name;
      if (!acc[categoryName]) {
        acc[categoryName] = { name: categoryName, value: 0, color: t.category!.color };
      }
      acc[categoryName].value += Number(t.amount);
      return acc;
    }, {} as Record<string, { name: string; value: number; color: string }>);

  const chartData = Object.values(expensesByCategory).sort((a, b) => b.value - a.value);
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">{formatCurrency(data.value)}</p>
          <p className="text-xs text-muted-foreground">
            {((data.value / total) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center gap-2 text-sm">
            <span 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 card-shadow animate-in">
        <h3 className="text-lg font-semibold mb-4">Gastos por Categoria</h3>
        <div className="h-[280px] flex items-center justify-center">
          <p className="text-muted-foreground">Nenhuma despesa registrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 card-shadow animate-in">
      <h3 className="text-lg font-semibold mb-4">Gastos por Categoria</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 20, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="40%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
