import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const getMonthName = (monthsAgo: number): string => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  return date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
};

export function MonthlyTrend() {
  const { trends, isLoading } = useDashboardData();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Tendência 3 Meses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const months = [
    { name: getMonthName(2), data: trends.twoMonthsAgo },
    { name: getMonthName(1), data: trends.previousMonth },
    { name: getMonthName(0), data: trends.currentMonth },
  ];

  const maxBalance = Math.max(...months.map((m) => Math.abs(m.data.balance)), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Tendência 3 Meses
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {months.map((month, index) => {
          const isPositive = month.data.balance >= 0;
          const barWidth = (Math.abs(month.data.balance) / maxBalance) * 100;
          const isCurrentMonth = index === months.length - 1;

          return (
            <div
              key={month.name}
              className={cn(
                "p-3 rounded-lg transition-colors",
                isCurrentMonth ? "bg-accent" : "hover:bg-accent/50"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "font-semibold uppercase text-sm",
                    isCurrentMonth && "text-primary"
                  )}>
                    {month.name}
                  </span>
                  {isCurrentMonth && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      Atual
                    </span>
                  )}
                </div>
                <div className={cn(
                  "flex items-center gap-1 font-bold",
                  isPositive ? "text-income" : "text-expense"
                )}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {formatCurrency(month.data.balance)}
                </div>
              </div>
              
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "absolute left-0 top-0 h-full rounded-full transition-all duration-500",
                    isPositive ? "bg-income" : "bg-expense"
                  )}
                  style={{ width: `${barWidth}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>+{formatCurrency(month.data.income)}</span>
                <span>-{formatCurrency(month.data.expense)}</span>
              </div>

              {index < months.length - 1 && (
                <div className="flex justify-center mt-2">
                  <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
