import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: number;
  variant?: 'default' | 'income' | 'expense' | 'balance';
  className?: string;
}

export function StatCard({ title, value, icon, trend, variant = 'default', className }: StatCardProps) {
  const isPositive = trend && trend > 0;
  
  return (
    <div className={cn(
      "relative overflow-hidden rounded-2xl p-6 bg-card card-shadow transition-all duration-300 hover:shadow-lg",
      className
    )}>
      {/* Background decoration */}
      <div className={cn(
        "absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2",
        variant === 'income' && "bg-income",
        variant === 'expense' && "bg-expense",
        variant === 'balance' && "bg-primary",
        variant === 'default' && "bg-primary"
      )} />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn(
            "text-2xl lg:text-3xl font-bold tracking-tight",
            variant === 'income' && "text-income",
            variant === 'expense' && "text-expense"
          )}>
            {value}
          </p>
          {trend !== undefined && (
            <div className={cn(
              "flex items-center gap-1 text-sm font-medium",
              isPositive ? "text-income" : "text-expense"
            )}>
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(trend)}% vs mês anterior</span>
            </div>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          variant === 'income' && "bg-income/10 text-income",
          variant === 'expense' && "bg-expense/10 text-expense",
          variant === 'balance' && "bg-primary/10 text-primary",
          variant === 'default' && "bg-primary/10 text-primary"
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
}
