import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Category {
  id: string;
  name: string;
  type: string;
}

export interface TransactionFiltersState {
  search: string;
  type: 'all' | 'income' | 'expense';
  categoryId: string;
  month: string;
  year: string;
}

interface TransactionFiltersProps {
  filters: TransactionFiltersState;
  onFiltersChange: (filters: TransactionFiltersState) => void;
  categories: Category[];
}

const months = [
  { value: 'all', label: 'Todos os meses' },
  { value: '0', label: 'Janeiro' },
  { value: '1', label: 'Fevereiro' },
  { value: '2', label: 'Março' },
  { value: '3', label: 'Abril' },
  { value: '4', label: 'Maio' },
  { value: '5', label: 'Junho' },
  { value: '6', label: 'Julho' },
  { value: '7', label: 'Agosto' },
  { value: '8', label: 'Setembro' },
  { value: '9', label: 'Outubro' },
  { value: '10', label: 'Novembro' },
  { value: '11', label: 'Dezembro' },
];

const years = ['all', '2024', '2025', '2026'];

export function TransactionFilters({ filters, onFiltersChange, categories }: TransactionFiltersProps) {
  const hasActiveFilters = 
    filters.search !== '' || 
    filters.type !== 'all' || 
    filters.categoryId !== 'all' || 
    filters.month !== 'all' || 
    filters.year !== 'all';

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      type: 'all',
      categoryId: 'all',
      month: 'all',
      year: 'all',
    });
  };

  const filteredCategories = filters.type === 'all' 
    ? categories 
    : categories.filter(c => c.type === filters.type);

  return (
    <div className="bg-card rounded-xl p-4 card-shadow space-y-4">
      <div className="flex flex-wrap gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9"
          />
        </div>

        {/* Type Filter */}
        <Select
          value={filters.type}
          onValueChange={(value: 'all' | 'income' | 'expense') => 
            onFiltersChange({ ...filters, type: value, categoryId: 'all' })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={filters.categoryId}
          onValueChange={(value) => onFiltersChange({ ...filters, categoryId: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Month Filter */}
        <Select
          value={filters.month}
          onValueChange={(value) => onFiltersChange({ ...filters, month: value })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Year Filter */}
        <Select
          value={filters.year}
          onValueChange={(value) => onFiltersChange({ ...filters, year: value })}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {years.filter(y => y !== 'all').map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters} className="shrink-0">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filtros ativos</span>
        </div>
      )}
    </div>
  );
}
