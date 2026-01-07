import { useState } from 'react';
import { 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip
} from 'recharts';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('pt-BR');
};

export function ReportsView() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

  // Category breakdown - Expenses
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

  const expenseCategoryData = Object.values(expensesByCategory).sort((a, b) => b.value - a.value);

  // Category breakdown - Income
  const incomeByCategory = transactions
    .filter(t => t.type === 'income' && t.category)
    .reduce((acc, t) => {
      const categoryName = t.category!.name;
      if (!acc[categoryName]) {
        acc[categoryName] = { name: categoryName, value: 0, color: t.category!.color };
      }
      acc[categoryName].value += Number(t.amount);
      return acc;
    }, {} as Record<string, { name: string; value: number; color: string }>);

  const incomeCategoryData = Object.values(incomeByCategory).sort((a, b) => b.value - a.value);

  // Filter transactions by selected category
  const [selectedCategoryType, setSelectedCategoryType] = useState<'expense' | 'income'>('expense');
  
  const categoryTransactions = selectedCategory
    ? transactions.filter(t => t.type === selectedCategoryType && t.category?.name === selectedCategory)
    : [];

  const handleCategoryClick = (categoryName: string, type: 'expense' | 'income') => {
    setSelectedCategory(categoryName);
    setSelectedCategoryType(type);
  };

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

      {/* Expenses Section */}
      {expenseCategoryData.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6 card-shadow">
            <h3 className="text-lg font-semibold mb-4">Despesas por Categoria</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    style={{ cursor: 'pointer' }}
                    onClick={(data) => handleCategoryClick(data.name, 'expense')}
                  >
                    {expenseCategoryData.map((entry, index) => (
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

          <Card className="p-6 card-shadow">
            <h3 className="text-lg font-semibold mb-4">Detalhamento - Despesas</h3>
            <div className="space-y-4">
              {expenseCategoryData.map((cat) => {
                const percentage = totalExpense > 0 ? (cat.value / totalExpense * 100) : 0;
                return (
                  <div 
                    key={cat.name} 
                    className="space-y-2 cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors"
                    onClick={() => handleCategoryClick(cat.name, 'expense')}
                  >
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
        <Card className="p-8 card-shadow text-center">
          <p className="text-muted-foreground">Nenhuma despesa encontrada para {months[parseInt(selectedMonth)].label} de {selectedYear}</p>
        </Card>
      )}

      {/* Income Section */}
      {incomeCategoryData.length > 0 ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-6 card-shadow">
            <h3 className="text-lg font-semibold mb-4">Receitas por Categoria</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    style={{ cursor: 'pointer' }}
                    onClick={(data) => handleCategoryClick(data.name, 'income')}
                  >
                    {incomeCategoryData.map((entry, index) => (
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

          <Card className="p-6 card-shadow">
            <h3 className="text-lg font-semibold mb-4">Detalhamento - Receitas</h3>
            <div className="space-y-4">
              {incomeCategoryData.map((cat) => {
                const percentage = totalIncome > 0 ? (cat.value / totalIncome * 100) : 0;
                return (
                  <div 
                    key={cat.name} 
                    className="space-y-2 cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors"
                    onClick={() => handleCategoryClick(cat.name, 'income')}
                  >
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
        <Card className="p-8 card-shadow text-center">
          <p className="text-muted-foreground">Nenhuma receita encontrada para {months[parseInt(selectedMonth)].label} de {selectedYear}</p>
        </Card>
      )}

      {/* Category Transactions Modal */}
      <Dialog open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {selectedCategoryType === 'expense' ? 'Despesas' : 'Receitas'} - {selectedCategory}
              <span className="text-muted-foreground font-normal ml-2">
                ({months[parseInt(selectedMonth)].label} {selectedYear})
              </span>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryTransactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{formatDate(t.date)}</TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell className={`text-right font-medium ${selectedCategoryType === 'expense' ? 'text-expense' : 'text-income'}`}>
                      {formatCurrency(Number(t.amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {categoryTransactions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma transação encontrada
              </p>
            )}
          </div>
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className={`font-bold ${selectedCategoryType === 'expense' ? 'text-expense' : 'text-income'}`}>
                {formatCurrency(categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0))}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
