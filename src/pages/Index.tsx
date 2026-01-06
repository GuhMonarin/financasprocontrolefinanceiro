import { Wallet, TrendingUp, TrendingDown, Plus } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { ExpenseChart } from '@/components/dashboard/ExpenseChart';
import { MonthlyChart } from '@/components/dashboard/MonthlyChart';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { mockTransactions, formatCurrency } from '@/data/mockData';
import { Button } from '@/components/ui/button';

const Index = () => {
  // Calculate summary data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyTransactions = mockTransactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const totalIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="animate-fade-in">
            <h1 className="text-2xl lg:text-3xl font-bold">
              Olá, João Paulo! 👋
            </h1>
            <p className="text-muted-foreground">
              Aqui está o resumo das suas finanças de Janeiro
            </p>
          </div>
          <Button className="gap-2 shadow-md w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Nova Transação
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 animate-slide-up">
          <StatCard
            title="Saldo Atual"
            value={formatCurrency(balance)}
            icon={<Wallet className="w-6 h-6" />}
            variant="balance"
            trend={8.2}
          />
          <StatCard
            title="Receitas do Mês"
            value={formatCurrency(totalIncome)}
            icon={<TrendingUp className="w-6 h-6" />}
            variant="income"
            trend={12.5}
          />
          <StatCard
            title="Despesas do Mês"
            value={formatCurrency(totalExpense)}
            icon={<TrendingDown className="w-6 h-6" />}
            variant="expense"
            trend={-5.3}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ExpenseChart />
          <MonthlyChart />
        </div>

        {/* Recent Transactions */}
        <RecentTransactions />
      </div>
    </MainLayout>
  );
};

export default Index;
