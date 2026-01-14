import { useState } from "react";
import {
  HelpCircle,
  Book,
  MessageCircle,
  Lightbulb,
  ChevronRight,
  X,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface InAppHelpProps {
  onStartTour?: () => void;
}

const faqItems = [
  {
    question: "Como adicionar uma transação?",
    answer:
      "Clique no botão 'Nova Transação' no Dashboard ou na página de Transações. Preencha os dados como valor, categoria, descrição e data.",
  },
  {
    question: "Como criar um orçamento?",
    answer:
      "Acesse a página 'Orçamentos' no menu lateral. Clique em 'Novo Orçamento', selecione uma categoria e defina o valor limite mensal.",
  },
  {
    question: "O que são transações recorrentes?",
    answer:
      "São transações que se repetem automaticamente, como salário mensal ou assinaturas. Ao criar, marque 'Transação recorrente' e escolha a frequência.",
  },
  {
    question: "Como ver relatórios?",
    answer:
      "Acesse a página 'Relatórios' para ver gráficos de tendências, comparativos mensais e análises por categoria.",
  },
  {
    question: "Como editar ou excluir uma categoria?",
    answer:
      "Na página 'Categorias', clique nos três pontos ao lado da categoria desejada e escolha 'Editar' ou 'Excluir'.",
  },
  {
    question: "Posso exportar meus dados?",
    answer:
      "Sim! Na página de Relatórios, clique no botão 'Exportar' para baixar seus dados em formato CSV ou PDF.",
  },
];

const tips = [
  "💡 Registre suas transações diariamente para ter um controle mais preciso.",
  "💡 Defina orçamentos para categorias com gastos altos.",
  "💡 Use a funcionalidade de transações recorrentes para automatizar lançamentos fixos.",
  "💡 Revise seus relatórios semanalmente para identificar padrões de gastos.",
  "💡 Categorize corretamente suas transações para análises mais precisas.",
];

export const InAppHelp = ({ onStartTour }: InAppHelpProps) => {
  const [randomTip] = useState(() => tips[Math.floor(Math.random() * tips.length)]);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-30 h-12 w-12 rounded-full shadow-lg"
        >
          <HelpCircle className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Book className="w-5 h-5" />
            Central de Ajuda
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Quick Tip */}
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm mb-1">Dica do Dia</h4>
                <p className="text-sm text-muted-foreground">{randomTip}</p>
              </div>
            </div>
          </div>

          {/* Tour Button */}
          {onStartTour && (
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={onStartTour}
            >
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Iniciar tour guiado
              </span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}

          {/* FAQ */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Perguntas Frequentes
            </h3>
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger className="text-left text-sm">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
};
