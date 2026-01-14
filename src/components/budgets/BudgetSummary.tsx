import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BudgetWithSpent } from '@/hooks/useBudgets';
import { PieChart, AlertTriangle, CheckCircle } from 'lucide-react';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface BudgetSummaryProps {
  budgets: BudgetWithSpent[];
}

export function BudgetSummary({ budgets }: BudgetSummaryProps) {
  const totalBudget = budgets.reduce((sum, b) => sum + Number(b.amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const totalPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const overBudgetCount = budgets.filter((b) => b.isOverBudget).length;
  const nearLimitCount = budgets.filter((b) => b.isNearLimit && !b.isOverBudget).length;
  const onTrackCount = budgets.filter((b) => !b.isOverBudget && !b.isNearLimit).length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Resumo do Mês
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Gasto Total</span>
            <span className="font-medium">{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}</span>
          </div>
          <Progress 
            value={Math.min(totalPercentage, 100)} 
            className="h-3"
            indicatorClassName={totalPercentage >= 100 ? 'bg-destructive' : totalPercentage >= 80 ? 'bg-amber-500' : 'bg-primary'}
          />
          <p className="text-sm text-muted-foreground text-right">
            {totalPercentage.toFixed(0)}% utilizado
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="text-center p-3 rounded-lg bg-primary/10">
            <CheckCircle className="w-5 h-5 mx-auto text-primary mb-1" />
            <p className="text-2xl font-bold text-primary">{onTrackCount}</p>
            <p className="text-xs text-muted-foreground">No limite</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-amber-500/10">
            <AlertTriangle className="w-5 h-5 mx-auto text-amber-500 mb-1" />
            <p className="text-2xl font-bold text-amber-600">{nearLimitCount}</p>
            <p className="text-xs text-muted-foreground">Perto do limite</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-destructive/10">
            <AlertTriangle className="w-5 h-5 mx-auto text-destructive mb-1" />
            <p className="text-2xl font-bold text-destructive">{overBudgetCount}</p>
            <p className="text-xs text-muted-foreground">Excedidos</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
