import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Plan {
  id: string;
  name: 'Free' | 'Premium';
  priceMonthly: number;
  features: {
    categories: number | 'unlimited';
    export: boolean;
    budgets: boolean;
    mobile: boolean;
  };
}

interface UserSubscription {
  id: string;
  planId: string;
  status: 'active' | 'expired' | 'canceled';
  startedAt: string;
  expiresAt: string | null;
}

interface PlanContextType {
  userPlan: Plan | null;
  subscription: UserSubscription | null;
  loading: boolean;
  error: string | null;
  isPremium: boolean;
  canExport: boolean;
  canUseBudgets: boolean;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [userPlan, setUserPlan] = useState<Plan | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      setUserPlan(null);
      setSubscription(null);
      return;
    }

    const fetchPlan = async () => {
      try {
        // Buscar plano do usuário
        const { data: subData, error: subError } = await supabase
          .from('user_subscriptions')
          .select(`
            id,
            plan_id,
            status,
            started_at,
            expires_at,
            subscription_plans(
              id,
              name,
              price_monthly_cents,
              features
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (subError) {
          throw subError;
        }

        if (subData) {
          const plan = subData.subscription_plans as any;
          setUserPlan({
            id: plan.id,
            name: plan.name,
            priceMonthly: plan.price_monthly_cents,
            features: plan.features,
          });
          setSubscription({
            id: subData.id,
            planId: subData.plan_id,
            status: subData.status as 'active' | 'expired' | 'canceled',
            startedAt: subData.started_at || '',
            expiresAt: subData.expires_at,
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar plano');
        console.error('Error fetching plan:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [user]);

  const value: PlanContextType = {
    userPlan,
    subscription,
    loading,
    error,
    isPremium: userPlan?.name === 'Premium',
    canExport: userPlan?.features.export ?? false,
    canUseBudgets: userPlan?.features.budgets ?? false,
  };

  return (
    <PlanContext.Provider value={value}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within PlanProvider');
  }
  return context;
}
