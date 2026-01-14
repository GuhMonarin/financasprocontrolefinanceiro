import { useState, useEffect, useRef } from "react";
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
  const [position, setPosition] = useState({ top: 24, left: 24 });
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset step when tour closes
      setCurrentStep(0);
      return;
    }

    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max);

    const getTooltipSize = () => {
      const el = tooltipRef.current;
      return {
        width: el?.offsetWidth ?? 320,
        height: el?.offsetHeight ?? 220,
      };
    };

    const updatePosition = () => {
      const step = tourSteps[currentStep];
      const element = document.querySelector(step.target) as HTMLElement | null;

      if (!element) return;

      // Clear all previous highlights first
      tourSteps.forEach((s) => {
        const el = document.querySelector(s.target) as HTMLElement | null;
        if (el) {
          el.classList.remove("ring-2", "ring-primary", "ring-offset-2", "relative");
          el.style.zIndex = "";
        }
      });

      // Highlight current element
      element.classList.add("ring-2", "ring-primary", "ring-offset-2", "relative");
      element.style.zIndex = "9999";

      const rect = element.getBoundingClientRect();
      const { width: tooltipWidth, height: tooltipHeight } = getTooltipSize();
      const padding = 12;

      const canFit = (pos: TourStep["position"]) => {
        if (pos === "top") return rect.top >= tooltipHeight + padding * 2;
        if (pos === "bottom")
          return window.innerHeight - rect.bottom >= tooltipHeight + padding * 2;
        if (pos === "left") return rect.left >= tooltipWidth + padding * 2;
        return window.innerWidth - rect.right >= tooltipWidth + padding * 2;
      };

      const preferred = step.position;
      const fallbackOrder: TourStep["position"][] = [
        preferred,
        "bottom",
        "top",
        "right",
        "left",
      ];
      const chosen = fallbackOrder.find(canFit) ?? preferred;

      let top = 0;
      let left = 0;

      switch (chosen) {
        case "bottom":
          top = rect.bottom + padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "top":
          top = rect.top - tooltipHeight - padding;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + padding;
          break;
        case "left":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - padding;
          break;
      }

      // Clamp inside viewport so actions (ex: "Próximo") never ficam escondidos
      top = clamp(top, padding, window.innerHeight - tooltipHeight - padding);
      left = clamp(left, padding, window.innerWidth - tooltipWidth - padding);

      setPosition({ top, left });
    };

    const raf = requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);

      // Remove all highlights
      tourSteps.forEach((step) => {
        const el = document.querySelector(step.target) as HTMLElement | null;
        if (el) {
          el.classList.remove("ring-2", "ring-primary", "ring-offset-2", "relative");
          el.style.zIndex = "";
        }
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
      <div className="fixed inset-0 bg-black/60 z-[9998]" onClick={onComplete} />

      {/* Tooltip */}
      <Card
        ref={tooltipRef}
        className="fixed z-[10000] w-80 p-4 shadow-xl animate-fade-in border-primary/20"
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
