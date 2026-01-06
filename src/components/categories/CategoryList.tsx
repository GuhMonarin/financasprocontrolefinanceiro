import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { defaultCategories } from '@/data/mockData';
import { Category, TransactionType } from '@/types/finance';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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

const availableIcons = [
  'utensils', 'home', 'car', 'gamepad-2', 'heart-pulse', 'graduation-cap',
  'shopping-cart', 'plane', 'gift', 'music', 'dumbbell', 'shirt',
  'banknote', 'laptop', 'trending-up', 'briefcase', 'more-horizontal'
];

const availableColors = [
  'hsl(38, 92%, 50%)', 'hsl(200, 70%, 50%)', 'hsl(280, 65%, 60%)',
  'hsl(340, 75%, 55%)', 'hsl(0, 72%, 51%)', 'hsl(160, 60%, 35%)',
  'hsl(142, 76%, 36%)', 'hsl(25, 95%, 53%)', 'hsl(262, 83%, 58%)',
];

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('more-horizontal');
  const [color, setColor] = useState(availableColors[0]);
  const [type, setType] = useState<TransactionType>('expense');

  const getIcon = (iconName: string) => {
    const formattedName = iconName.split('-').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join('');
    const IconComponent = Icons[formattedName as keyof typeof Icons] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  const openModal = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setName(category.name);
      setIcon(category.icon);
      setColor(category.color);
      setType(category.type);
    } else {
      setSelectedCategory(undefined);
      setName('');
      setIcon('more-horizontal');
      setColor(availableColors[0]);
      setType('expense');
    }
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Informe o nome da categoria');
      return;
    }

    if (selectedCategory) {
      setCategories(prev => prev.map(c =>
        c.id === selectedCategory.id ? { ...c, name, icon, color, type } : c
      ));
      toast.success('Categoria atualizada!');
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        name,
        icon,
        color,
        type,
      };
      setCategories(prev => [...prev, newCategory]);
      toast.success('Categoria criada!');
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    toast.success('Categoria excluída');
    setDeleteId(null);
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Categorias</h2>
          <p className="text-muted-foreground">Organize suas transações por categoria</p>
        </div>
        <Button onClick={() => openModal()} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Categoria
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expense Categories */}
        <div className="bg-card rounded-2xl p-6 card-shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-expense" />
            Despesas
          </h3>
          <div className="space-y-2">
            {expenseCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    {getIcon(category.icon)}
                  </div>
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openModal(category)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Income Categories */}
        <div className="bg-card rounded-2xl p-6 card-shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-income" />
            Receitas
          </h3>
          <div className="space-y-2">
            {incomeCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${category.color}20`, color: category.color }}
                  >
                    {getIcon(category.icon)}
                  </div>
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openModal(category)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteId(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <Tabs value={type} onValueChange={(v) => setType(v as TransactionType)}>
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
              <Label>Nome</Label>
              <Input
                placeholder="Ex: Alimentação"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Ícone</Label>
              <div className="grid grid-cols-6 gap-2">
                {availableIcons.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      icon === iconName 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {getIcon(iconName)}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2 flex-wrap">
                {availableColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1">
                {selectedCategory ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A categoria será permanentemente removida.
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
