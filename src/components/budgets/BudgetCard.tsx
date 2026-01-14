import { icons } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { BudgetWithSpent } from '@/hooks/useBudgets';
import { cn } from '@/lib/utils';

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface BudgetCardProps {
  budget: BudgetWithSpent;
  onEdit: (budget: BudgetWithSpent) => void;
  onDelete: (id: string) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const IconComponent = budget.category?.icon 
    ? icons[budget.category.icon as keyof typeof icons] 
    : icons['Circle'];

  const progressColor = budget.isOverBudget
    ? 'bg-destructive'
    : budget.isNearLimit
    ? 'bg-amber-500'
    : 'bg-primary';

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-md",
      budget.isOverBudget && "border-destructive/50 bg-destructive/5",
      budget.isNearLimit && !budget.isOverBudget && "border-amber-500/50 bg-amber-500/5"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: budget.category?.color || 'hsl(var(--muted))' }}
            >
              {IconComponent && <IconComponent className="w-5 h-5 text-white" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{budget.category?.name}</h3>
                {(budget.isNearLimit || budget.isOverBudget) && (
                  <AlertTriangle className={cn(
                    "w-4 h-4 shrink-0",
                    budget.isOverBudget ? "text-destructive" : "text-amber-500"
                  )} />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(budget.spent)} de {formatCurrency(Number(budget.amount))}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(budget)}>
              <Pencil className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(budget.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className={cn(
              "font-medium",
              budget.isOverBudget && "text-destructive",
              budget.isNearLimit && !budget.isOverBudget && "text-amber-600"
            )}>
              {budget.percentage.toFixed(0)}%
            </span>
            <span className="text-muted-foreground">
              {budget.isOverBudget 
                ? `Excedeu ${formatCurrency(budget.spent - Number(budget.amount))}`
                : `Restam ${formatCurrency(Number(budget.amount) - budget.spent)}`
              }
            </span>
          </div>
          <Progress 
            value={Math.min(budget.percentage, 100)} 
            className="h-2"
            indicatorClassName={progressColor}
          />
        </div>

        {budget.isOverBudget && (
          <p className="text-sm text-destructive mt-3 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Orçamento excedido!
          </p>
        )}
        {budget.isNearLimit && !budget.isOverBudget && (
          <p className="text-sm text-amber-600 mt-3 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Atenção: 80% do orçamento utilizado
          </p>
        )}
      </CardContent>
    </Card>
  );
}
