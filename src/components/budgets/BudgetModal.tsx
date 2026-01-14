import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories } from '@/hooks/useCategories';
import { useCreateBudget, useUpdateBudget, BudgetWithSpent } from '@/hooks/useBudgets';
import { icons, Loader2 } from 'lucide-react';
import { budgetSchema } from '@/lib/schemas';
import { toast } from 'sonner';

interface BudgetModalProps {
  open: boolean;
  onClose: () => void;
  budget?: BudgetWithSpent | null;
  month: number;
  year: number;
  existingCategoryIds: string[];
}

export function BudgetModal({ open, onClose, budget, month, year, existingCategoryIds }: BudgetModalProps) {
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');

  const { data: categories = [] } = useCategories();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();

  const expenseCategories = categories.filter(
    (c) => c.type === 'expense' && (!existingCategoryIds.includes(c.id) || c.id === budget?.category_id)
  );

  useEffect(() => {
    if (budget) {
      setCategoryId(budget.category_id);
      setAmount(String(budget.amount));
    } else {
      setCategoryId('');
      setAmount('');
    }
  }, [budget, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount.replace(',', '.'));
    
    const data = {
      category_id: categoryId,
      amount: amountNum,
      month: month + 1,
      year,
    };

    const result = budgetSchema.safeParse(data);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    if (budget) {
      await updateBudget.mutateAsync({ id: budget.id, amount: amountNum });
    } else {
      await createBudget.mutateAsync(data);
    }
    onClose();
  };

  const isLoading = createBudget.isPending || updateBudget.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{budget ? 'Editar Budget' : 'Novo Budget'}</DialogTitle>
          <DialogDescription>
            {budget
              ? 'Altere o valor do orçamento para esta categoria.'
              : 'Defina um limite de gastos mensal para uma categoria.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={!!budget}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {expenseCategories.map((category) => {
                  const IconComponent = icons[category.icon as keyof typeof icons];
                  return (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-2">
                        {IconComponent && (
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center"
                            style={{ backgroundColor: category.color }}
                          >
                            <IconComponent className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <span>{category.name}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Valor Mensal (R$)</Label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="500,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !categoryId || !amount}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {budget ? 'Salvar' : 'Criar Budget'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
