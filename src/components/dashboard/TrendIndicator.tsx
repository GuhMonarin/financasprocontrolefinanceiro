import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendIndicatorProps {
  trend: number;
  inverseColors?: boolean; // For expenses, higher = bad
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function TrendIndicator({ 
  trend, 
  inverseColors = false, 
  showLabel = true,
  size = 'md' 
}: TrendIndicatorProps) {
  const isPositive = trend > 0;
  const isNeutral = trend === 0;
  
  // For expenses: positive trend (spending more) = bad = red
  // For income: positive trend (earning more) = good = green
  const isGood = inverseColors ? !isPositive : isPositive;
  
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  if (isNeutral) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <Minus className={iconSize} />
        {showLabel && <span className={cn(textSize, 'font-medium')}>0%</span>}
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center gap-1 font-medium",
      isGood ? "text-income" : "text-expense",
      textSize
    )}>
      {isPositive ? (
        <TrendingUp className={iconSize} />
      ) : (
        <TrendingDown className={iconSize} />
      )}
      {showLabel && <span>{Math.abs(Math.round(trend))}%</span>}
    </div>
  );
}
