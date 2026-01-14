import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Pencil, Trash2, Plus, Loader2, Repeat, CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TransactionModal } from './TransactionModal';
import { TransactionFilters, TransactionFiltersState } from './TransactionFilters';
import { useDeleteTransaction, Transaction } from '@/hooks/useTransactions';
import { useTransactionsPaginated } from '@/hooks/useTransactionsPaginated';
import { useCategories } from '@/hooks/useCategories';
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

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export function TransactionList() {
  const { data: categories = [] } = useCategories();
  const deleteTransaction = useDeleteTransaction();
  const loadMoreRef = useRef<HTMLDivElement>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFiltersState>(() => {
    const now = new Date();
    return {
      search: '',
      type: 'all',
      categoryId: 'all',
      month: String(now.getMonth()),
      year: String(now.getFullYear()),
    };
  });

  // Convert filters for the paginated hook
  const paginatedFilters = useMemo(() => ({
    month: filters.month !== 'all' ? parseInt(filters.month) : undefined,
    year: filters.year !== 'all' ? parseInt(filters.year) : undefined,
    type: filters.type as 'income' | 'expense' | 'all',
    categoryId: filters.categoryId,
    search: filters.search,
  }), [filters]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useTransactionsPaginated(paginatedFilters);

  // Flatten all pages into a single array
  const transactions = useMemo(() => 
    data?.pages.flatMap(page => page.data) ?? [], 
    [data]
  );

  const totalCount = data?.pages[0]?.totalCount ?? 0;

  // Infinite scroll observer
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: '100px',
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  const getIcon = (iconName: string) => {
    const formattedName = iconName.split('-').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join('');
    const IconComponent = Icons[formattedName as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  const handleDelete = (id: string) => {
    deleteTransaction.mutate(id);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transações</h2>
          <p className="text-muted-foreground">
            Gerencie suas receitas e despesas
            {totalCount > 0 && (
              <span className="ml-2 text-sm">
                ({transactions.length} de {totalCount})
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => { setSelectedTransaction(undefined); setModalOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Transação
        </Button>
      </div>

      <TransactionFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
        categories={categories} 
      />

      {transactions.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 card-shadow text-center">
          <p className="text-muted-foreground">Nenhuma transação encontrada</p>
          <Button onClick={() => setModalOpen(true)} variant="outline" className="mt-4">
            Adicionar primeira transação
          </Button>
        </div>
      ) : (
        <div className="bg-card rounded-2xl card-shadow overflow-hidden">
          {sortedDates.map((date) => (
            <div key={date}>
              <div className="px-6 py-3 bg-muted/50 border-b border-border">
                <p className="text-sm font-medium text-muted-foreground">
                  {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR', { 
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
                      style={{ 
                        backgroundColor: transaction.category ? `${transaction.category.color}15` : 'hsl(var(--muted))', 
                        color: transaction.category?.color || 'hsl(var(--muted-foreground))' 
                      }}
                    >
                      {transaction.category && getIcon(transaction.category.icon)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{transaction.description}</p>
                        {transaction.is_recurring && !transaction.installment_count && (
                          <Badge variant="secondary" className="gap-1 text-xs px-2 py-0.5">
                            <Repeat className="w-3 h-3" />
                            Fixa
                          </Badge>
                        )}
                        {transaction.installment_count && transaction.current_installment && (
                          <Badge variant="outline" className="gap-1 text-xs px-2 py-0.5">
                            <CreditCard className="w-3 h-3" />
                            {transaction.current_installment}/{transaction.installment_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{transaction.category?.name || 'Sem categoria'}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className={cn(
                          "font-semibold text-lg",
                          transaction.type === 'income' ? "text-income" : "text-expense"
                        )}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(Number(transaction.amount))}
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
          
          {/* Infinite scroll trigger */}
          <div ref={loadMoreRef} className="py-4 flex justify-center">
            {isFetchingNextPage && (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            )}
            {!hasNextPage && transactions.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Todas as transações carregadas
              </p>
            )}
          </div>
        </div>
      )}

      <TransactionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedTransaction(undefined); }}
        transaction={selectedTransaction}
        categories={categories}
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
