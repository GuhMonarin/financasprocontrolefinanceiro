import { Category, Transaction, MonthSummary } from '@/types/finance';

export const defaultCategories: Category[] = [
  { id: '1', name: 'Alimentação', icon: 'utensils', color: 'hsl(38, 92%, 50%)', type: 'expense' },
  { id: '2', name: 'Aluguel', icon: 'home', color: 'hsl(200, 70%, 50%)', type: 'expense' },
  { id: '3', name: 'Transporte', icon: 'car', color: 'hsl(280, 65%, 60%)', type: 'expense' },
  { id: '4', name: 'Lazer', icon: 'gamepad-2', color: 'hsl(340, 75%, 55%)', type: 'expense' },
  { id: '5', name: 'Saúde', icon: 'heart-pulse', color: 'hsl(0, 72%, 51%)', type: 'expense' },
  { id: '6', name: 'Educação', icon: 'graduation-cap', color: 'hsl(160, 60%, 35%)', type: 'expense' },
  { id: '7', name: 'Outros', icon: 'more-horizontal', color: 'hsl(160, 15%, 45%)', type: 'expense' },
  { id: '8', name: 'Salário', icon: 'banknote', color: 'hsl(142, 76%, 36%)', type: 'income' },
  { id: '9', name: 'Freelance', icon: 'laptop', color: 'hsl(160, 55%, 45%)', type: 'income' },
  { id: '10', name: 'Investimentos', icon: 'trending-up', color: 'hsl(200, 70%, 50%)', type: 'income' },
];

export const mockTransactions: Transaction[] = [
  { id: '1', amount: 5500, category: defaultCategories[7], description: 'Salário mensal', date: '2026-01-05', type: 'income' },
  { id: '2', amount: 1200, category: defaultCategories[1], description: 'Aluguel do apartamento', date: '2026-01-05', type: 'expense' },
  { id: '3', amount: 450, category: defaultCategories[0], description: 'Supermercado', date: '2026-01-04', type: 'expense' },
  { id: '4', amount: 89, category: defaultCategories[2], description: 'Uber', date: '2026-01-04', type: 'expense' },
  { id: '5', amount: 150, category: defaultCategories[3], description: 'Cinema e jantar', date: '2026-01-03', type: 'expense' },
  { id: '6', amount: 800, category: defaultCategories[8], description: 'Projeto freelance', date: '2026-01-02', type: 'income' },
  { id: '7', amount: 200, category: defaultCategories[4], description: 'Farmácia', date: '2026-01-02', type: 'expense' },
  { id: '8', amount: 350, category: defaultCategories[5], description: 'Curso online', date: '2026-01-01', type: 'expense' },
  { id: '9', amount: 180, category: defaultCategories[0], description: 'Restaurante', date: '2025-12-30', type: 'expense' },
  { id: '10', amount: 120, category: defaultCategories[2], description: 'Gasolina', date: '2025-12-28', type: 'expense' },
];

export const mockMonthlyData: MonthSummary[] = [
  { month: 'Ago', income: 6200, expense: 4100, balance: 2100 },
  { month: 'Set', income: 5800, expense: 4500, balance: 1300 },
  { month: 'Out', income: 6500, expense: 3900, balance: 2600 },
  { month: 'Nov', income: 5900, expense: 4800, balance: 1100 },
  { month: 'Dez', income: 7200, expense: 5200, balance: 2000 },
  { month: 'Jan', income: 6300, expense: 2439, balance: 3861 },
];

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date);
};
