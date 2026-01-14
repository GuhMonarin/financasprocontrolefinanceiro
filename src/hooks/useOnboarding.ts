import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const ONBOARDING_KEY = "financaspro_onboarding_complete";

const defaultCategories = [
  { name: "Salário", icon: "💰", color: "#22c55e", type: "income" },
  { name: "Freelance", icon: "💼", color: "#10b981", type: "income" },
  { name: "Investimentos", icon: "📈", color: "#14b8a6", type: "income" },
  { name: "Outros Ganhos", icon: "🎁", color: "#06b6d4", type: "income" },
  { name: "Alimentação", icon: "🛒", color: "#f97316", type: "expense" },
  { name: "Transporte", icon: "🚗", color: "#ef4444", type: "expense" },
  { name: "Moradia", icon: "🏠", color: "#8b5cf6", type: "expense" },
  { name: "Contas", icon: "💡", color: "#eab308", type: "expense" },
  { name: "Lazer", icon: "🎮", color: "#ec4899", type: "expense" },
  { name: "Saúde", icon: "🏥", color: "#06b6d4", type: "expense" },
  { name: "Educação", icon: "📚", color: "#3b82f6", type: "expense" },
  { name: "Compras", icon: "🛍️", color: "#f43f5e", type: "expense" },
];

export const useOnboarding = () => {
  const { user } = useAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTour, setShowTour] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    try {
      // Check localStorage first
      const completed = localStorage.getItem(`${ONBOARDING_KEY}_${user?.id}`);
      if (completed === "true") {
        setIsLoading(false);
        return;
      }

      // Check if user has any categories (existing user)
      const { data: categories } = await supabase
        .from("categories")
        .select("id")
        .eq("user_id", user?.id)
        .limit(1);

      if (categories && categories.length > 0) {
        // Existing user with categories, mark as complete
        markOnboardingComplete();
      } else {
        // New user, show welcome
        setShowWelcome(true);
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const markOnboardingComplete = () => {
    localStorage.setItem(`${ONBOARDING_KEY}_${user?.id}`, "true");
    setShowWelcome(false);
    setShowTour(false);
  };

  const createDefaultCategories = async () => {
    if (!user) return;

    try {
      const categoriesToInsert = defaultCategories.map((cat) => ({
        ...cat,
        user_id: user.id,
        is_default: true,
      }));

      const { error } = await supabase
        .from("categories")
        .insert(categoriesToInsert);

      if (error) throw error;

      toast({
        title: "Categorias criadas!",
        description: "Adicionamos categorias comuns para você começar.",
      });
    } catch (error) {
      console.error("Error creating categories:", error);
      toast({
        title: "Erro",
        description: "Não foi possível criar as categorias.",
        variant: "destructive",
      });
    }
  };

  const startTour = () => {
    setShowWelcome(false);
    setShowTour(true);
  };

  const endTour = () => {
    setShowTour(false);
    markOnboardingComplete();
  };

  const closeWelcome = () => {
    setShowWelcome(false);
    markOnboardingComplete();
  };

  const resetOnboarding = () => {
    localStorage.removeItem(`${ONBOARDING_KEY}_${user?.id}`);
    setShowWelcome(true);
  };

  return {
    showWelcome,
    showTour,
    isLoading,
    startTour,
    endTour,
    closeWelcome,
    createDefaultCategories,
    resetOnboarding,
  };
};
