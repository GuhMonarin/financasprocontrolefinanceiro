import { useState } from "react";
import { Rocket, Wallet, PiggyBank, TrendingUp, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WelcomeModalProps {
  open: boolean;
  onClose: () => void;
  onStartTour: () => void;
  onCreateCategories: () => void;
}

const features = [
  {
    icon: Wallet,
    title: "Controle de Transações",
    description: "Registre receitas e despesas facilmente",
  },
  {
    icon: PiggyBank,
    title: "Orçamentos Mensais",
    description: "Defina limites por categoria",
  },
  {
    icon: TrendingUp,
    title: "Relatórios Detalhados",
    description: "Visualize para onde vai seu dinheiro",
  },
];

export const WelcomeModal = ({
  open,
  onClose,
  onStartTour,
  onCreateCategories,
}: WelcomeModalProps) => {
  const [step, setStep] = useState<"welcome" | "categories">("welcome");
  const [creatingCategories, setCreatingCategories] = useState(false);

  const handleCreateCategories = async () => {
    setCreatingCategories(true);
    await onCreateCategories();
    setCreatingCategories(false);
    setStep("categories");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {step === "welcome" ? (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Rocket className="w-8 h-8 text-primary" />
              </div>
              <DialogTitle className="text-2xl">
                Bem-vindo ao FinançasPro!
              </DialogTitle>
              <DialogDescription>
                Organize suas finanças de forma simples e inteligente
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 my-4">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={handleCreateCategories} disabled={creatingCategories}>
                {creatingCategories ? "Criando..." : "Começar com categorias exemplo"}
              </Button>
              <Button variant="outline" onClick={onStartTour}>
                Fazer tour guiado
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Pular e explorar sozinho
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <DialogTitle className="text-2xl">
                Categorias Criadas! 🎉
              </DialogTitle>
              <DialogDescription>
                Adicionamos categorias comuns para você começar
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-2 my-4">
              {[
                "💰 Salário",
                "🛒 Alimentação",
                "🚗 Transporte",
                "🏠 Moradia",
                "💡 Contas",
                "🎮 Lazer",
                "🏥 Saúde",
                "📚 Educação",
              ].map((cat) => (
                <div
                  key={cat}
                  className="p-2 rounded-lg bg-muted/50 text-sm text-center"
                >
                  {cat}
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <Button onClick={onStartTour}>
                Fazer tour guiado
              </Button>
              <Button variant="outline" onClick={onClose}>
                Começar a usar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
