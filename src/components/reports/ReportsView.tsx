import { useState, useMemo, useCallback, memo } from 'react';
import { 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip
} from 'recharts';
import { useTransactions, Transaction } from '@/hooks/useTransactions';
import { useTransactionsMultiMonth, MonthData } from '@/hooks/useTransactionsMultiMonth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Loader2, Repeat, CreditCard, BarChart3, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { MonthComparisonChart } from './MonthComparisonChart';
import { TrendsCard } from './TrendsCard';
import { CategoryTrendsChart } from './CategoryTrendsChart';
import { ExportButton } from './ExportButton';

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

// Memoized components for performance
const SummaryCards = memo(function SummaryCards({ 
  totalIncome, 
  totalExpense, 
  balance 
}: { 
  totalIncome: number; 
  totalExpense: number; 
  balance: number;
}) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      <Card className="p-4 sm:p-5 card-shadow">
        <p className="text-sm text-muted-foreground mb-1">Receitas</p>
        <p className="text-xl sm:text-2xl font-bold text-income">{formatCurrency(totalIncome)}</p>
      </Card>

      <Card className="p-4 sm:p-5 card-shadow">
        <p className="text-sm text-muted-foreground mb-1">Despesas</p>
        <p className="text-xl sm:text-2xl font-bold text-expense">{formatCurrency(totalExpense)}</p>
      </Card>

      <Card className="p-4 sm:p-5 card-shadow">
        <p className="text-sm text-muted-foreground mb-1">Saldo</p>
        <p className={`text-xl sm:text-2xl font-bold ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
          {formatCurrency(balance)}
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
          {balance >= 0 ? 'Você está no positivo!' : 'Atenção aos gastos'}
        </p>
      </Card>
    </div>
  );
});

const CustomPieTooltip = ({ active, payload }: any) => {
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

const CategoryPieChart = memo(function CategoryPieChart({
  data,
  title,
  onCategoryClick,
  type,
}: {
  data: { name: string; value: number; color: string }[];
  title: string;
  onCategoryClick: (name: string, type: 'expense' | 'income') => void;
  type: 'expense' | 'income';
}) {
  if (data.length === 0) return null;

  return (
    <Card className="p-4 sm:p-6 card-shadow">
      <h3 className="text-base sm:text-lg font-semibold mb-4">{title}</h3>
      <div className="h-[250px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              style={{ cursor: 'pointer' }}
              onClick={(d) => onCategoryClick(d.name, type)}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend 
              formatter={(value) => <span className="text-xs sm:text-sm text-muted-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
});

const CategoryBreakdown = memo(function CategoryBreakdown({
  data,
  title,
  total,
  onCategoryClick,
  type,
}: {
  data: { name: string; value: number; color: string }[];
  title: string;
  total: number;
  onCategoryClick: (name: string, type: 'expense' | 'income') => void;
  type: 'expense' | 'income';
}) {
  return (
    <Card className="p-4 sm:p-6 card-shadow">
      <h3 className="text-base sm:text-lg font-semibold mb-4">{title}</h3>
      <div className="space-y-3 sm:space-y-4">
        {data.map((cat) => {
          const percentage = total > 0 ? (cat.value / total * 100) : 0;
          return (
            <div 
              key={cat.name} 
              className="space-y-2 cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors"
              onClick={() => onCategoryClick(cat.name, type)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-sm sm:text-base truncate">{cat.name}</span>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <span className="text-xs sm:text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
                  <span className="font-semibold text-sm sm:text-base">{formatCurrency(cat.value)}</span>
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
  );
});

export function ReportsView() {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth().toString());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCategoryType, setSelectedCategoryType] = useState<'expense' | 'income'>('expense');
  const [activeTab, setActiveTab] = useState('monthly');

  // Calculate last 3 months for comparison
  const comparisonMonths = useMemo(() => {
    const result: { month: number; year: number }[] = [];
    let m = parseInt(selectedMonth);
    let y = parseInt(selectedYear);
    
    for (let i = 0; i < 3; i++) {
      result.unshift({ month: m, year: y });
      m--;
      if (m < 0) {
        m = 11;
        y--;
      }
    }
    return result;
  }, [selectedMonth, selectedYear]);

  // Single month data
  const { data: transactions = [], isLoading: isLoadingSingle } = useTransactions(
    parseInt(selectedMonth), 
    parseInt(selectedYear)
  );

  // Multi-month data for comparison
  const { data: multiMonthData = [], isLoading: isLoadingMulti } = useTransactionsMultiMonth(comparisonMonths);

  const isLoading = activeTab === 'monthly' ? isLoadingSingle : isLoadingMulti;

  // Memoized calculations for single month
  const { totalIncome, totalExpense, balance, expenseCategoryData, incomeCategoryData } = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

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

    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      expenseCategoryData: Object.values(expensesByCategory).sort((a, b) => b.value - a.value),
      incomeCategoryData: Object.values(incomeByCategory).sort((a, b) => b.value - a.value),
    };
  }, [transactions]);

  // Category transactions for modal
  const categoryTransactions = useMemo(() => {
    if (!selectedCategory) return [];
    return transactions.filter(t => t.type === selectedCategoryType && t.category?.name === selectedCategory);
  }, [transactions, selectedCategory, selectedCategoryType]);

  const handleCategoryClick = useCallback((categoryName: string, type: 'expense' | 'income') => {
    setSelectedCategory(categoryName);
    setSelectedCategoryType(type);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Relatórios</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Análise detalhada das suas finanças</p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[120px] sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[90px] sm:w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <ExportButton data={multiMonthData} disabled={isLoadingMulti} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full sm:w-auto grid grid-cols-2 sm:inline-flex">
          <TabsTrigger value="monthly" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Mês Atual</span>
            <span className="sm:hidden">Mensal</span>
          </TabsTrigger>
          <TabsTrigger value="comparison" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Comparativo (3 meses)</span>
            <span className="sm:hidden">Comparar</span>
          </TabsTrigger>
        </TabsList>

        {/* Monthly View */}
        <TabsContent value="monthly" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <SummaryCards totalIncome={totalIncome} totalExpense={totalExpense} balance={balance} />

          {/* Expenses Section */}
          {expenseCategoryData.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <CategoryPieChart
                data={expenseCategoryData}
                title="Despesas por Categoria"
                onCategoryClick={handleCategoryClick}
                type="expense"
              />
              <CategoryBreakdown
                data={expenseCategoryData}
                title="Detalhamento - Despesas"
                total={totalExpense}
                onCategoryClick={handleCategoryClick}
                type="expense"
              />
            </div>
          ) : (
            <Card className="p-6 sm:p-8 card-shadow text-center">
              <p className="text-muted-foreground">Nenhuma despesa encontrada para {months[parseInt(selectedMonth)].label} de {selectedYear}</p>
            </Card>
          )}

          {/* Income Section */}
          {incomeCategoryData.length > 0 ? (
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              <CategoryPieChart
                data={incomeCategoryData}
                title="Receitas por Categoria"
                onCategoryClick={handleCategoryClick}
                type="income"
              />
              <CategoryBreakdown
                data={incomeCategoryData}
                title="Detalhamento - Receitas"
                total={totalIncome}
                onCategoryClick={handleCategoryClick}
                type="income"
              />
            </div>
          ) : (
            <Card className="p-6 sm:p-8 card-shadow text-center">
              <p className="text-muted-foreground">Nenhuma receita encontrada para {months[parseInt(selectedMonth)].label} de {selectedYear}</p>
            </Card>
          )}
        </TabsContent>

        {/* Comparison View */}
        <TabsContent value="comparison" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {isLoadingMulti ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Comparison Chart + Trends */}
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <MonthComparisonChart data={multiMonthData} formatCurrency={formatCurrency} />
                </div>
                <TrendsCard data={multiMonthData} formatCurrency={formatCurrency} />
              </div>

              {/* Category Trends */}
              <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                <CategoryTrendsChart data={multiMonthData} type="expense" formatCurrency={formatCurrency} />
                <CategoryTrendsChart data={multiMonthData} type="income" formatCurrency={formatCurrency} />
              </div>

              {/* Monthly Summary Table */}
              <Card className="p-4 sm:p-6 card-shadow overflow-x-auto">
                <h3 className="text-base sm:text-lg font-semibold mb-4">Resumo por Mês</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mês</TableHead>
                      <TableHead className="text-right">Receitas</TableHead>
                      <TableHead className="text-right">Despesas</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {multiMonthData.map((m) => (
                      <TableRow key={m.label}>
                        <TableCell className="font-medium">{m.label}</TableCell>
                        <TableCell className="text-right text-income">{formatCurrency(m.income)}</TableCell>
                        <TableCell className="text-right text-expense">{formatCurrency(m.expense)}</TableCell>
                        <TableCell className={`text-right font-semibold ${m.balance >= 0 ? 'text-income' : 'text-expense'}`}>
                          {formatCurrency(m.balance)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Category Transactions Modal */}
      <Dialog open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {selectedCategoryType === 'expense' ? 'Despesas' : 'Receitas'} - {selectedCategory}
              <span className="text-muted-foreground font-normal ml-2 text-sm">
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
                    <TableCell className="text-sm">{formatDate(t.date)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm">{t.description}</span>
                        {t.is_recurring && !t.installment_count && (
                          <Badge variant="secondary" className="gap-1 text-xs px-2 py-0.5">
                            <Repeat className="w-3 h-3" />
                            Fixa
                          </Badge>
                        )}
                        {t.installment_count && t.current_installment && (
                          <Badge variant="outline" className="gap-1 text-xs px-2 py-0.5">
                            <CreditCard className="w-3 h-3" />
                            {t.current_installment}/{t.installment_count}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-medium text-sm ${selectedCategoryType === 'expense' ? 'text-expense' : 'text-income'}`}>
                      {formatCurrency(Number(t.amount))}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {categoryTransactions.length === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">
                Nenhuma transação encontrada
              </p>
            )}
          </div>
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">Total</span>
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
