import { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';

const months = [
  { value: '0', label: 'Janeiro' },
  { value: '1', label: 'Fevereiro' },
  { value: '2', label: 'Março' },
  { value: '3', label: 'Abril' },
  { value: '4', label: 'Maio' },
  { value: '5', label: 'Junho' },
  { value: '6', label: 'Julho' },
  { value: '7', label: 'Agosto' },
  { value: '8', label: 'Setembro' },
  { value: '9', label: 'Outubro' },
  { value: '10', label: 'Novembro' },
  { value: '11', label: 'Dezembro' },
];

const years = ['2024', '2025', '2026'];

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function ReportsView() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());

  const { data: transactions = [], isLoading } = useTransactions(
    parseInt(selectedMonth), 
    parseInt(selectedYear)
  );

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  // Category breakdown
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

  const categoryData = Object.values(expensesByCategory).sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">{formatCurrency(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Relatórios</h2>
          <p className="text-muted-foreground">Análise detalhada das suas finanças</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 card-shadow">
          <p className="text-sm text-muted-foreground mb-1">Receitas</p>
          <p className="text-2xl font-bold text-income">{formatCurrency(totalIncome)}</p>
        </Card>

        <Card className="p-5 card-shadow">
          <p className="text-sm text-muted-foreground mb-1">Despesas</p>
          <p className="text-2xl font-bold text-expense">{formatCurrency(totalExpense)}</p>
        </Card>

        <Card className="p-5 card-shadow">
          <p className="text-sm text-muted-foreground mb-1">Saldo</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
            {formatCurrency(balance)}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {balance >= 0 ? 'Você está no positivo!' : 'Atenção aos gastos'}
          </p>
        </Card>
      </div>

      {categoryData.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Category Breakdown */}
          <Card className="p-6 card-shadow">
            <h3 className="text-lg font-semibold mb-4">Despesas por Categoria</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Category Details */}
          <Card className="p-6 card-shadow">
            <h3 className="text-lg font-semibold mb-4">Detalhamento</h3>
            <div className="space-y-4">
              {categoryData.map((cat) => {
                const percentage = totalExpense > 0 ? (cat.value / totalExpense * 100) : 0;
                return (
                  <div key={cat.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{cat.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                        <span className="font-semibold">{formatCurrency(cat.value)}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: cat.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      ) : (
        <Card className="p-12 card-shadow text-center">
          <p className="text-muted-foreground">
            Nenhuma transação encontrada para {months[parseInt(selectedMonth)].label} de {selectedYear}
          </p>
        </Card>
      )}
    </div>
  );
}
