import { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Pencil, Trash2, Plus } from 'lucide-react';
import { mockTransactions, formatCurrency, formatDate } from '@/data/mockData';
import { Transaction } from '@/types/finance';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TransactionModal } from './TransactionModal';
import { toast } from 'sonner';
import * as Icons from 'lucide-react';
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

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  const handleSave = (data: Partial<Transaction>) => {
    if (data.id) {
      setTransactions(prev => prev.map(t => 
        t.id === data.id ? { ...t, ...data } as Transaction : t
      ));
    } else {
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        amount: data.amount!,
        category: data.category!,
        description: data.description!,
        date: data.date!,
        type: data.type!,
      };
      setTransactions(prev => [newTransaction, ...prev]);
    }
    setSelectedTransaction(undefined);
  };

  const handleDelete = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.success('Transação excluída');
    setDeleteId(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalOpen(true);
  };

  const groupedTransactions = transactions.reduce((groups, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  const sortedDates = Object.keys(groupedTransactions).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transações</h2>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas</p>
        </div>
        <Button onClick={() => { setSelectedTransaction(undefined); setModalOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Transação
        </Button>
      </div>

      <div className="bg-card rounded-2xl card-shadow overflow-hidden">
        {sortedDates.map((date) => (
          <div key={date}>
            <div className="px-6 py-3 bg-muted/50 border-b border-border">
              <p className="text-sm font-medium text-muted-foreground">
                {new Date(date).toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
            <div className="divide-y divide-border">
              {groupedTransactions[date].map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-accent/30 transition-colors"
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${transaction.category.color}15`, color: transaction.category.color }}
                  >
                    {getIcon(transaction.category.icon)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.category.name}</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={cn(
                        "font-semibold text-lg",
                        transaction.type === 'income' ? "text-income" : "text-expense"
                      )}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEdit(transaction)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(transaction.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedTransaction(undefined); }}
        transaction={selectedTransaction}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir transação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A transação será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
