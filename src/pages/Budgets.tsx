import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, ChevronLeft, ChevronRight, PiggyBank } from 'lucide-react';
import { useBudgetsWithSpent, useDeleteBudget, BudgetWithSpent } from '@/hooks/useBudgets';
import { BudgetCard } from '@/components/budgets/BudgetCard';
import { BudgetModal } from '@/components/budgets/BudgetModal';
import { BudgetSummary } from '@/components/budgets/BudgetSummary';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const months = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const Budgets = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithSpent | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: budgets = [], isLoading } = useBudgetsWithSpent(selectedMonth, selectedYear);
  const deleteBudget = useDeleteBudget();

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleEdit = (budget: BudgetWithSpent) => {
    setEditingBudget(budget);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteBudget.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const existingCategoryIds = budgets.map((b) => b.category_id);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
              <PiggyBank className="w-8 h-8" />
              Orçamentos
            </h1>
            <p className="text-muted-foreground">
              Defina limites de gastos por categoria
            </p>
          </div>
          <Button onClick={() => { setEditingBudget(null); setModalOpen(true); }} className="gap-2">
            <Plus className="w-4 h-4" />
            Novo Budget
          </Button>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-4">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-lg font-medium min-w-[180px] text-center">
            {months[selectedMonth]} {selectedYear}
          </span>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : budgets.length === 0 ? (
          <div className="text-center py-12">
            <PiggyBank className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum orçamento definido</h3>
            <p className="text-muted-foreground mb-4">
              Crie orçamentos para controlar seus gastos por categoria
            </p>
            <Button onClick={() => { setEditingBudget(null); setModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Budget
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Summary Card */}
            <div className="lg:col-span-1">
              <BudgetSummary budgets={budgets} />
            </div>

            {/* Budget Cards */}
            <div className="lg:col-span-2 space-y-4">
              {budgets.map((budget) => (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  onEdit={handleEdit}
                  onDelete={setDeleteId}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <BudgetModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingBudget(null); }}
        budget={editingBudget}
        month={selectedMonth}
        year={selectedYear}
        existingCategoryIds={existingCategoryIds}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Budgets;
