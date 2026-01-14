import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowRight, PiggyBank } from 'lucide-react';
import { icons } from 'lucide-react';
import { useBudgetsWithSpent, BudgetWithSpent } from '@/hooks/useBudgets';
import { cn } from '@/lib/utils';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function BudgetAlerts() {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const { data: budgets = [], isLoading } = useBudgetsWithSpent(currentMonth, currentYear);

  // Filter budgets that need attention (80%+ spent)
  const alertBudgets = budgets.filter((b) => b.isNearLimit || b.isOverBudget);

  if (isLoading || budgets.length === 0) {
    return null;
  }

  if (alertBudgets.length === 0) {
    return (
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-primary">Todos os orçamentos no limite!</p>
              <p className="text-sm text-muted-foreground">Continue assim 💪</p>
            </div>
            <Link to="/budgets">
              <Button variant="ghost" size="sm">
                Ver todos <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Alertas de Orçamento
          </CardTitle>
          <Link to="/budgets">
            <Button variant="ghost" size="sm">
              Ver todos <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {alertBudgets.slice(0, 3).map((budget) => (
          <BudgetAlertItem key={budget.id} budget={budget} />
        ))}
        {alertBudgets.length > 3 && (
          <p className="text-sm text-muted-foreground text-center pt-2">
            + {alertBudgets.length - 3} outros alertas
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function BudgetAlertItem({ budget }: { budget: BudgetWithSpent }) {
  const IconComponent = budget.category?.icon 
    ? icons[budget.category.icon as keyof typeof icons] 
    : icons['Circle'];

  return (
    <div className={cn(
      "p-3 rounded-lg border",
      budget.isOverBudget ? "bg-destructive/5 border-destructive/30" : "bg-amber-500/5 border-amber-500/30"
    )}>
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-8 h-8 rounded flex items-center justify-center"
          style={{ backgroundColor: budget.category?.color }}
        >
          {IconComponent && <IconComponent className="w-4 h-4 text-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{budget.category?.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(budget.spent)} / {formatCurrency(Number(budget.amount))}
          </p>
        </div>
        <span className={cn(
          "text-sm font-bold",
          budget.isOverBudget ? "text-destructive" : "text-amber-600"
        )}>
          {budget.percentage.toFixed(0)}%
        </span>
      </div>
      <Progress 
        value={Math.min(budget.percentage, 100)} 
        className="h-1.5"
        indicatorClassName={budget.isOverBudget ? 'bg-destructive' : 'bg-amber-500'}
      />
    </div>
  );
}
