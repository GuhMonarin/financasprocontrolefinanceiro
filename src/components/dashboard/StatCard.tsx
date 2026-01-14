import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendIndicator } from './TrendIndicator';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: number;
  trendInverse?: boolean; // For expenses where higher = bad
  variant?: 'default' | 'income' | 'expense' | 'balance';
  className?: string;
  subtitle?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendInverse = false,
  variant = 'default', 
  className,
  subtitle
}: StatCardProps) {
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
            <div className="flex items-center gap-2">
              <TrendIndicator trend={trend} inverseColors={trendInverse} />
              <span className="text-xs text-muted-foreground">vs mês anterior</span>
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
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
