import { memo } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { MonthData } from '@/hooks/useTransactionsMultiMonth';

interface TrendsCardProps {
  data: MonthData[];
  formatCurrency: (value: number) => string;
}

export const TrendsCard = memo(function TrendsCard({ data, formatCurrency }: TrendsCardProps) {
  if (data.length < 2) {
    return (
      <Card className="p-4 sm:p-6 card-shadow">
        <h3 className="text-lg font-semibold mb-4">Tendências</h3>
        <p className="text-muted-foreground text-sm">
          Selecione pelo menos 2 meses para ver tendências
        </p>
      </Card>
    );
  }

  const sorted = [...data].sort((a, b) => 
    a.year !== b.year ? a.year - b.year : a.month - b.month
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const incomeChange = first.income > 0 
    ? ((last.income - first.income) / first.income) * 100 
    : last.income > 0 ? 100 : 0;

  const expenseChange = first.expense > 0 
    ? ((last.expense - first.expense) / first.expense) * 100 
    : last.expense > 0 ? 100 : 0;

  const balanceChange = last.balance - first.balance;

  const avgIncome = sorted.reduce((sum, m) => sum + m.income, 0) / sorted.length;
  const avgExpense = sorted.reduce((sum, m) => sum + m.expense, 0) / sorted.length;

  const TrendIcon = ({ value, inverse = false }: { value: number; inverse?: boolean }) => {
    const isPositive = inverse ? value < 0 : value > 0;
    if (Math.abs(value) < 1) return <Minus className="w-4 h-4 text-muted-foreground" />;
    if (isPositive) return <TrendingUp className="w-4 h-4 text-income" />;
    return <TrendingDown className="w-4 h-4 text-expense" />;
  };

  const ChangeIndicator = ({ value, inverse = false }: { value: number; inverse?: boolean }) => {
    const isPositive = inverse ? value < 0 : value > 0;
    const color = Math.abs(value) < 1 
      ? 'text-muted-foreground' 
      : isPositive ? 'text-income' : 'text-expense';
    const Arrow = isPositive ? ArrowUpRight : ArrowDownRight;
    
    return (
      <span className={`flex items-center gap-1 text-sm font-medium ${color}`}>
        {Math.abs(value) >= 1 && <Arrow className="w-3 h-3" />}
        {value >= 0 ? '+' : ''}{value.toFixed(1)}%
      </span>
    );
  };

  return (
    <Card className="p-4 sm:p-6 card-shadow">
      <h3 className="text-lg font-semibold mb-4">Tendências ({sorted.length} meses)</h3>
      
      <div className="space-y-4">
        {/* Income trend */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <TrendIcon value={incomeChange} />
            <div>
              <p className="font-medium text-sm">Receitas</p>
              <p className="text-xs text-muted-foreground">
                Média: {formatCurrency(avgIncome)}
              </p>
            </div>
          </div>
          <ChangeIndicator value={incomeChange} />
        </div>

        {/* Expense trend */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <TrendIcon value={expenseChange} inverse />
            <div>
              <p className="font-medium text-sm">Despesas</p>
              <p className="text-xs text-muted-foreground">
                Média: {formatCurrency(avgExpense)}
              </p>
            </div>
          </div>
          <ChangeIndicator value={expenseChange} inverse />
        </div>

        {/* Balance change */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Variação do saldo</span>
            <span className={`font-semibold ${balanceChange >= 0 ? 'text-income' : 'text-expense'}`}>
              {balanceChange >= 0 ? '+' : ''}{formatCurrency(balanceChange)}
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="text-xs text-muted-foreground text-center pt-2">
          Comparando {first.label} com {last.label}
        </div>
      </div>
    </Card>
  );
});
