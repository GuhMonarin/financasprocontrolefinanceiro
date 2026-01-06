import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { defaultCategories } from '@/data/mockData';
import { Transaction, TransactionType } from '@/types/finance';
import { toast } from 'sonner';
import * as Icons from 'lucide-react';

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction;
  onSave: (transaction: Partial<Transaction>) => void;
}

export function TransactionModal({ open, onClose, transaction, onSave }: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>(transaction?.type || 'expense');
  const [amount, setAmount] = useState(transaction?.amount?.toString() || '');
  const [categoryId, setCategoryId] = useState(transaction?.category?.id || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [date, setDate] = useState(transaction?.date || new Date().toISOString().split('T')[0]);

  const filteredCategories = defaultCategories.filter(c => c.type === type);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !categoryId || !description) {
      toast.error('Preencha todos os campos');
      return;
    }

    const category = defaultCategories.find(c => c.id === categoryId);
    if (!category) return;

    onSave({
      id: transaction?.id,
      amount: parseFloat(amount),
      category,
      description,
      date,
      type,
    });

    toast.success(transaction ? 'Transação atualizada!' : 'Transação adicionada!');
    onClose();
  };

  const getIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {transaction ? 'Editar Transação' : 'Nova Transação'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Tabs value={type} onValueChange={(v) => {
            setType(v as TransactionType);
            setCategoryId('');
          }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expense" className="data-[state=active]:bg-expense data-[state=active]:text-expense-foreground">
                Despesa
              </TabsTrigger>
              <TabsTrigger value="income" className="data-[state=active]:bg-income data-[state=active]:text-income-foreground">
                Receita
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span style={{ color: category.color }}>{getIcon(category.icon)}</span>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Almoço no restaurante"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              {transaction ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
