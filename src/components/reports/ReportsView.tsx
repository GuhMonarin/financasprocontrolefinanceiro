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
import { mockTransactions, mockMonthlyData, formatCurrency } from '@/data/mockData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const months = [
  { value: '01', label: 'Janeiro' },
  { value: '02', label: 'Fevereiro' },
  { value: '03', label: 'Março' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Maio' },
  { value: '06', label: 'Junho' },
  { value: '07', label: 'Julho' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

const years = ['2024', '2025', '2026'];

export function ReportsView() {
  const [selectedMonth, setSelectedMonth] = useState('01');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Filter transactions for selected month
  const filteredTransactions = mockTransactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === parseInt(selectedMonth) - 1 && 
           date.getFullYear() === parseInt(selectedYear);
  });

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  // Category breakdown
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const categoryName = t.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = { name: categoryName, value: 0, color: t.category.color };
      }
      acc[categoryName].value += t.amount;
      return acc;
    }, {} as Record<string, { name: string; value: number; color: string }>);

  const categoryData = Object.values(expensesByCategory).sort((a, b) => b.value - a.value);

  // Comparison data
  const currentMonthIndex = mockMonthlyData.length - 1;
  const previousMonthIndex = currentMonthIndex - 1;
  const currentMonth = mockMonthlyData[currentMonthIndex];
  const previousMonth = mockMonthlyData[previousMonthIndex];

  const incomeChange = previousMonth 
    ? ((currentMonth.income - previousMonth.income) / previousMonth.income * 100).toFixed(1)
    : 0;
  const expenseChange = previousMonth 
    ? ((currentMonth.expense - previousMonth.expense) / previousMonth.expense * 100).toFixed(1)
    : 0;

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
          <div className="flex items-center gap-1 mt-2 text-sm">
            {Number(incomeChange) > 0 ? (
              <TrendingUp className="w-4 h-4 text-income" />
            ) : Number(incomeChange) < 0 ? (
              <TrendingDown className="w-4 h-4 text-expense" />
            ) : (
              <Minus className="w-4 h-4 text-muted-foreground" />
            )}
            <span className={Number(incomeChange) >= 0 ? "text-income" : "text-expense"}>
              {incomeChange}% vs mês anterior
            </span>
          </div>
        </Card>

        <Card className="p-5 card-shadow">
          <p className="text-sm text-muted-foreground mb-1">Despesas</p>
          <p className="text-2xl font-bold text-expense">{formatCurrency(totalExpense)}</p>
          <div className="flex items-center gap-1 mt-2 text-sm">
            {Number(expenseChange) < 0 ? (
              <TrendingDown className="w-4 h-4 text-income" />
            ) : Number(expenseChange) > 0 ? (
              <TrendingUp className="w-4 h-4 text-expense" />
            ) : (
              <Minus className="w-4 h-4 text-muted-foreground" />
            )}
            <span className={Number(expenseChange) <= 0 ? "text-income" : "text-expense"}>
              {expenseChange}% vs mês anterior
            </span>
          </div>
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

        {/* Monthly Comparison */}
        <Card className="p-6 card-shadow">
          <h3 className="text-lg font-semibold mb-4">Comparativo Mensal</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockMonthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="income" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} name="Receitas" />
                <Bar dataKey="expense" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Category Details */}
      <Card className="p-6 card-shadow">
        <h3 className="text-lg font-semibold mb-4">Detalhamento por Categoria</h3>
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
  );
}
