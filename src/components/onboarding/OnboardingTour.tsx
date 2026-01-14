import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface TourStep {
  target: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
}

const tourSteps: TourStep[] = [
  {
    target: "[data-tour='dashboard']",
    title: "Bem-vindo ao FinançasPro! 🎉",
    content: "Este é seu painel principal. Aqui você tem uma visão geral das suas finanças do mês.",
    position: "bottom",
  },
  {
    target: "[data-tour='new-transaction']",
    title: "Adicione Transações",
    content: "Clique aqui para registrar receitas e despesas. Você pode categorizar e até criar transações recorrentes!",
    position: "bottom",
  },
  {
    target: "[data-tour='stats']",
    title: "Resumo Financeiro",
    content: "Acompanhe seu saldo, receitas e despesas do mês em tempo real.",
    position: "bottom",
  },
  {
    target: "[data-tour='charts']",
    title: "Gráficos e Análises",
    content: "Visualize para onde seu dinheiro está indo com gráficos interativos.",
    position: "top",
  },
  {
    target: "[data-tour='nav']",
    title: "Navegação",
    content: "Acesse Transações, Categorias, Orçamentos e Relatórios pelo menu lateral.",
    position: "right",
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
  isOpen: boolean;
}

export const OnboardingTour = ({ onComplete, isOpen }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      const step = tourSteps[currentStep];
      const element = document.querySelector(step.target);

      if (element) {
        const rect = element.getBoundingClientRect();
        const scrollTop = window.scrollY;
        const scrollLeft = window.scrollX;

        let top = 0;
        let left = 0;

        switch (step.position) {
          case "bottom":
            top = rect.bottom + scrollTop + 12;
            left = rect.left + scrollLeft + rect.width / 2;
            break;
          case "top":
            top = rect.top + scrollTop - 12;
            left = rect.left + scrollLeft + rect.width / 2;
            break;
          case "right":
            top = rect.top + scrollTop + rect.height / 2;
            left = rect.right + scrollLeft + 12;
            break;
          case "left":
            top = rect.top + scrollTop + rect.height / 2;
            left = rect.left + scrollLeft - 12;
            break;
        }

        setPosition({ top, left });

        // Highlight element
        element.classList.add("ring-2", "ring-primary", "ring-offset-2", "z-50", "relative");
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      // Remove highlights
      tourSteps.forEach((step) => {
        const el = document.querySelector(step.target);
        el?.classList.remove("ring-2", "ring-primary", "ring-offset-2", "z-50", "relative");
      });
    };
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const isLast = currentStep === tourSteps.length - 1;
  const isFirst = currentStep === 0;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onComplete} />

      {/* Tooltip */}
      <Card
        className={cn(
          "fixed z-50 w-80 p-4 shadow-xl animate-fade-in",
          step.position === "bottom" && "-translate-x-1/2",
          step.position === "top" && "-translate-x-1/2 -translate-y-full",
          step.position === "right" && "-translate-y-1/2",
          step.position === "left" && "-translate-x-full -translate-y-1/2"
        )}
        style={{ top: position.top, left: position.left }}
      >
        <button
          onClick={onComplete}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">{step.title}</h3>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{step.content}</p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  idx === currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {!isFirst && (
              <Button variant="ghost" size="sm" onClick={handlePrev}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" onClick={handleNext}>
              {isLast ? "Concluir" : "Próximo"}
              {!isLast && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};
