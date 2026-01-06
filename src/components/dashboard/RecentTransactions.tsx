import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { mockTransactions, formatCurrency, formatDate } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import * as Icons from 'lucide-react';

export function RecentTransactions() {
  const recentTransactions = mockTransactions.slice(0, 5);

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  return (
    <div className="bg-card rounded-2xl p-6 card-shadow animate-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Transações Recentes</h3>
        <Link to="/transactions">
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            Ver todas
          </Button>
        </Link>
      </div>
      
      <div className="space-y-3">
        {recentTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors"
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${transaction.category.color}20`, color: transaction.category.color }}
            >
              {getIcon(transaction.category.icon)}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{transaction.description}</p>
              <p className="text-sm text-muted-foreground">
                {transaction.category.name} • {formatDate(transaction.date)}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={cn(
                "font-semibold",
                transaction.type === 'income' ? "text-income" : "text-expense"
              )}>
                {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
              </span>
              <div className={cn(
                "p-1 rounded-full",
                transaction.type === 'income' ? "bg-income/10" : "bg-expense/10"
              )}>
                {transaction.type === 'income' ? (
                  <ArrowDownLeft className="w-3 h-3 text-income" />
                ) : (
                  <ArrowUpRight className="w-3 h-3 text-expense" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
