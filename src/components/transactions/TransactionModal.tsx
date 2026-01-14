import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Category } from "@/hooks/useCategories";
import {
  Transaction,
  useCreateTransaction,
  useUpdateTransaction,
} from "@/hooks/useTransactions";
import { toast } from "sonner";
import * as Icons from "lucide-react";
import { Loader2, Repeat, CreditCard } from "lucide-react";
import { transactionFormSchema } from "@/lib/schemas";

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction;
  categories: Category[];
}

export function TransactionModal({
  open,
  onClose,
  transaction,
  categories,
}: TransactionModalProps) {
  const [type, setType] = useState<"income" | "expense">(
    transaction?.type || "expense"
  );
  const [amount, setAmount] = useState(transaction?.amount?.toString() || "");
  const [categoryId, setCategoryId] = useState(transaction?.category_id || "");
  const [description, setDescription] = useState(
    transaction?.description || ""
  );
  const [date, setDate] = useState(
    transaction?.date || new Date().toISOString().split("T")[0]
  );
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceType, setRecurrenceType] = useState<"fixed" | "installment">(
    "fixed"
  );
  const [installmentCount, setInstallmentCount] = useState("2");
  const [fixedFrequency, setFixedFrequency] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");

  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();

  const filteredCategories = categories.filter((c) => c.type === type);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setCategoryId(transaction.category_id || "");
      setDescription(transaction.description);
      setDate(transaction.date);
      setIsRecurring(false);
      setRecurrenceType("fixed");
      setInstallmentCount("2");
      setFixedFrequency("monthly");
    } else {
      setType("expense");
      setAmount("");
      setCategoryId("");
      setDescription("");
      setDate(new Date().toISOString().split("T")[0]);
      setIsRecurring(false);
      setRecurrenceType("fixed");
      setInstallmentCount("2");
      setFixedFrequency("monthly");
    }
  }, [transaction, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    const parsedInstallments =
      isRecurring && recurrenceType === "installment"
        ? parseInt(installmentCount)
        : null;

    const data = {
      amount: parsedAmount,
      category_id: categoryId,
      description: description.trim(),
      date,
      type,
      is_recurring: isRecurring,
      recurrence_type: isRecurring ? recurrenceType : null,
      installment_count: parsedInstallments,
      fixed_frequency: isRecurring && recurrenceType === "fixed" ? fixedFrequency : null,
    };

    const result = transactionFormSchema.safeParse(data);
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    if (transaction) {
      await updateTransaction.mutateAsync({
        id: transaction.id,
        amount: data.amount,
        category_id: data.category_id,
        description: data.description,
        date: data.date,
        type: data.type,
      });
    } else {
      await createTransaction.mutateAsync(data);
    }

    onClose();
  };

  const getIcon = (iconName: string) => {
    const formattedName = iconName
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");
    const IconComponent = Icons[
      formattedName as keyof typeof Icons
    ] as React.ComponentType<{ className?: string }>;
    return IconComponent ? <IconComponent className="w-4 h-4" /> : null;
  };

  const isLoading = createTransaction.isPending || updateTransaction.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {transaction ? "Editar Transação" : "Nova Transação"}
          </DialogTitle>
          <DialogDescription>
            {transaction
              ? "Edite os detalhes da transação abaixo."
              : "Preencha os campos para adicionar uma nova transação."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Tabs
            value={type}
            onValueChange={(v) => {
              setType(v as "income" | "expense");
              setCategoryId("");
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="expense"
                className="data-[state=active]:bg-expense data-[state=active]:text-expense-foreground"
              >
                Despesa
              </TabsTrigger>
              <TabsTrigger
                value="income"
                className="data-[state=active]:bg-income data-[state=active]:text-income-foreground"
              >
                Receita
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <span style={{ color: category.color }}>
                        {getIcon(category.icon)}
                      </span>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Almoço no restaurante"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">
              {isRecurring && recurrenceType === "fixed"
                ? "Data de Vencimento"
                : isRecurring && recurrenceType === "installment"
                ? "Data da 1ª Parcela"
                : "Data"}
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Recurring options - only for new transactions */}
          {!transaction && (
            <div className="space-y-4 p-4 rounded-lg border border-border bg-muted/30">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={isRecurring}
                  onCheckedChange={(checked) =>
                    setIsRecurring(checked === true)
                  }
                />
                <Label
                  htmlFor="recurring"
                  className="cursor-pointer font-medium"
                >
                  Transação recorrente ou parcelada
                </Label>
              </div>

              {isRecurring && (
                <RadioGroup
                  value={recurrenceType}
                  onValueChange={(v) =>
                    setRecurrenceType(v as "fixed" | "installment")
                  }
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-3 p-3 rounded-md border border-border bg-background">
                    <RadioGroupItem
                      value="fixed"
                      id="fixed"
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="fixed"
                        className="cursor-pointer flex items-center gap-2 font-medium"
                      >
                        <Repeat className="w-4 h-4 text-primary" />
                        Fixa Recorrente
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Repete automaticamente na frequência escolhida
                      </p>
                      {recurrenceType === "fixed" && (
                        <div className="mt-3">
                          <Select value={fixedFrequency} onValueChange={(v) => setFixedFrequency(v as "daily" | "weekly" | "monthly" | "yearly")}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Frequência" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Diário</SelectItem>
                              <SelectItem value="weekly">Semanal</SelectItem>
                              <SelectItem value="monthly">Mensal</SelectItem>
                              <SelectItem value="yearly">Anual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 rounded-md border border-border bg-background">
                    <RadioGroupItem
                      value="installment"
                      id="installment"
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <Label
                        htmlFor="installment"
                        className="cursor-pointer flex items-center gap-2 font-medium"
                      >
                        <CreditCard className="w-4 h-4 text-primary" />
                        Parcelado
                      </Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        Divide em várias parcelas mensais
                      </p>
                      {recurrenceType === "installment" && (
                        <div className="mt-3 flex items-center gap-2">
                          <Input
                            type="number"
                            min="2"
                            max="99"
                            value={installmentCount}
                            onChange={(e) =>
                              setInstallmentCount(e.target.value)
                            }
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">
                            parcelas
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : transaction ? (
                "Salvar"
              ) : (
                "Adicionar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
