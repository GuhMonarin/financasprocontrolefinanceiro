import { Wallet, TrendingUp, TrendingDown, Plus, Loader2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ExpenseChart } from "@/components/dashboard/ExpenseChart";
import { MonthlyChart } from "@/components/dashboard/MonthlyChart";
import { MonthlyTrend } from "@/components/dashboard/MonthlyTrend";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { BudgetAlerts } from "@/components/dashboard/BudgetAlerts";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { useTransactions } from "@/hooks/useTransactions";
import { useCategories } from "@/hooks/useCategories";
import { useProfile } from "@/hooks/useProfile";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Button } from "@/components/ui/button";
import { PlanBadge } from "@/components/PlanBadge";
import { cn } from "@/lib/utils";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const Dashboard = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const { data: transactions = [], isLoading: transactionsLoading, refetch } =
    useTransactions(currentMonth, currentYear);
  const { data: categories = [] } = useCategories();
  const { data: profile } = useProfile();
  const { 
    totalBalance, 
    currentMonthIncome, 
    currentMonthExpense, 
    trends,
    isLoading: dashboardLoading 
  } = useDashboardData();

  const monthName = new Date().toLocaleDateString("pt-BR", { month: "long" });
  const firstName = profile?.full_name?.split(" ")[0] || "Usuário";

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (transactionsLoading || dashboardLoading) {
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              className={cn(isRefreshing && "animate-spin")}
              title="Atualizar dados"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setModalOpen(true)}
              className="gap-2 shadow-md flex-1 sm:flex-none"
            >
              <Plus className="w-4 h-4" />
              Nova Transação
            </Button>
          </div>
        </div>

        {/* Stats Grid - 4 columns on large screens */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-slide-up">
          <StatCard
            title="Saldo Total"
            value={formatCurrency(totalBalance)}
            icon={<Wallet className="w-6 h-6" />}
            variant="balance"
            subtitle="Atualizado em tempo real"
          />
          <StatCard
            title="Receitas do Mês"
            value={formatCurrency(currentMonthIncome)}
            icon={<TrendingUp className="w-6 h-6" />}
            variant="income"
            trend={trends.incomeTrend}
          />
          <StatCard
            title="Despesas do Mês"
            value={formatCurrency(currentMonthExpense)}
            icon={<TrendingDown className="w-6 h-6" />}
            variant="expense"
            trend={trends.expenseTrend}
            trendInverse
          />
          <StatCard
            title="Balanço do Mês"
            value={formatCurrency(currentMonthIncome - currentMonthExpense)}
            icon={
              currentMonthIncome >= currentMonthExpense ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )
            }
            variant={currentMonthIncome >= currentMonthExpense ? "income" : "expense"}
            trend={trends.balanceTrend}
          />
        </div>

        {/* Budget Alerts */}
        <BudgetAlerts />

        {/* Charts Row - 3 columns */}
        <div className="grid gap-6 lg:grid-cols-3">
          <ExpenseChart transactions={transactions} />
          <MonthlyChart />
          <MonthlyTrend />
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
