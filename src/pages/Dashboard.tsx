import { Wallet, TrendingUp, TrendingDown, Plus, Loader2 } from "lucide-react";
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { BudgetAlerts } from "@/components/dashboard/BudgetAlerts";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { PlanBadge } from "@/components/PlanBadge";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const Dashboard = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const { data: transactions = [], isLoading: transactionsLoading } =
    useTransactions(currentMonth, currentYear);
  const { data: categories = [] } = useCategories();
  const { data: profile } = useProfile();

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  const monthName = new Date().toLocaleDateString("pt-BR", { month: "long" });
  const firstName = profile?.full_name?.split(" ")[0] || "Usuário";

  if (transactionsLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl lg:text-3xl font-bold">
                Olá, {firstName}! 👋
              </h1>
              <PlanBadge />
            </div>
            <p className="text-muted-foreground">
              Aqui está o resumo das suas finanças de {monthName}
            </p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            className="gap-2 shadow-md w-full sm:w-auto"
          >
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
          />
          <StatCard
            title="Receitas do Mês"
            value={formatCurrency(totalIncome)}
            icon={<TrendingUp className="w-6 h-6" />}
            variant="income"
          />
          <StatCard
            title="Despesas do Mês"
            value={formatCurrency(totalExpense)}
            icon={<TrendingDown className="w-6 h-6" />}
            variant="expense"
          />
        </div>

        {/* Budget Alerts */}
        <BudgetAlerts />

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <ExpenseChart transactions={transactions} />
          <MonthlyChart />
        </div>

        {/* Recent Transactions */}
        <RecentTransactions transactions={transactions} />
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        categories={categories}
      />
    </MainLayout>
  );
};

export default Dashboard;
