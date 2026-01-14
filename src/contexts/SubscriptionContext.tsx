import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionState {
  subscribed: boolean;
  plan: 'Free' | 'Premium';
  subscriptionEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface SubscriptionContextType extends SubscriptionState {
  loading: boolean;
  error: string | null;
  isPremium: boolean;
  canExport: boolean;
  canUseBudgets: boolean;
  checkSubscription: () => Promise<void>;
  createCheckout: (priceId: string) => Promise<string | null>;
  openCustomerPortal: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    subscribed: false,
    plan: 'Free',
    subscriptionEnd: null,
    cancelAtPeriodEnd: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSubscription = useCallback(async () => {
    if (!session?.access_token) {
      setState({
        subscribed: false,
        plan: 'Free',
        subscriptionEnd: null,
        cancelAtPeriodEnd: false,
      });
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const { data, error: fnError } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (fnError) throw fnError;

      setState({
        subscribed: data.subscribed,
        plan: data.plan || 'Free',
        subscriptionEnd: data.subscription_end,
        cancelAtPeriodEnd: data.cancel_at_period_end || false,
      });
    } catch (err) {
      console.error('Error checking subscription:', err);
      setError(err instanceof Error ? err.message : 'Erro ao verificar assinatura');
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  const createCheckout = useCallback(async (priceId: string): Promise<string | null> => {
    if (!session?.access_token) {
      setError('Usuário não autenticado');
      return null;
    }

    try {
      setError(null);
      const { data, error: fnError } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (fnError) throw fnError;

      return data.url;
    } catch (err) {
      console.error('Error creating checkout:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar checkout');
      return null;
    }
  }, [session?.access_token]);

  const openCustomerPortal = useCallback(async () => {
    if (!session?.access_token) {
      setError('Usuário não autenticado');
      return;
    }

    try {
      setError(null);
      const { data, error: fnError } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (fnError) throw fnError;

      window.open(data.url, '_blank');
    } catch (err) {
      console.error('Error opening customer portal:', err);
      setError(err instanceof Error ? err.message : 'Erro ao abrir portal');
    }
  }, [session?.access_token]);

  // Check subscription on mount and when user changes
  useEffect(() => {
    if (user) {
      checkSubscription();
    } else {
      setState({
        subscribed: false,
        plan: 'Free',
        subscriptionEnd: null,
        cancelAtPeriodEnd: false,
      });
      setLoading(false);
    }
  }, [user, checkSubscription]);

  // Refresh subscription every minute
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, checkSubscription]);

  // Check for checkout success in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      // Wait a bit for Stripe to process
      setTimeout(checkSubscription, 2000);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [checkSubscription]);

  const value: SubscriptionContextType = {
    ...state,
    loading,
    error,
    isPremium: state.plan === 'Premium',
    canExport: state.plan === 'Premium',
    canUseBudgets: state.plan === 'Premium',
    checkSubscription,
    createCheckout,
    openCustomerPortal,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
}
