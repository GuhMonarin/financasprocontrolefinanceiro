import { z } from 'zod';

// ==================== User/Auth Schemas ====================

export const loginSchema = z.object({
  email: z.string()
    .trim()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(72, 'Senha deve ter no máximo 72 caracteres'),
});

export const signupSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string()
    .trim()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  password: z.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(72, 'Senha deve ter no máximo 72 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

export const profileSchema = z.object({
  fullName: z.string()
    .trim()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string()
    .trim()
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres')
    .optional(),
});

// ==================== Transaction Schemas ====================

export const transactionSchema = z.object({
  amount: z.number()
    .positive('Valor deve ser maior que zero')
    .max(999999999.99, 'Valor muito alto'),
  category_id: z.string()
    .uuid('Categoria inválida')
    .min(1, 'Selecione uma categoria'),
  description: z.string()
    .trim()
    .min(1, 'Descrição é obrigatória')
    .max(200, 'Descrição deve ter no máximo 200 caracteres'),
  date: z.string()
    .min(1, 'Data é obrigatória')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Tipo inválido' }),
  }),
  is_recurring: z.boolean().optional().default(false),
  recurrence_type: z.enum(['fixed', 'installment']).nullable().optional(),
  installment_count: z.number()
    .int('Número de parcelas deve ser inteiro')
    .min(2, 'Mínimo de 2 parcelas')
    .max(99, 'Máximo de 99 parcelas')
    .nullable()
    .optional(),
});

export const transactionFormSchema = transactionSchema.refine(
  (data) => {
    if (data.is_recurring && data.recurrence_type === 'installment') {
      return data.installment_count !== null && data.installment_count >= 2;
    }
    return true;
  },
  {
    message: 'Número de parcelas deve ser entre 2 e 99',
    path: ['installment_count'],
  }
);

// ==================== Category Schemas ====================

export const categorySchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Nome é obrigatório')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  icon: z.string()
    .min(1, 'Ícone é obrigatório'),
  color: z.string()
    .min(1, 'Cor é obrigatória')
    .regex(/^hsl\(\d+,\s*\d+%,\s*\d+%\)$/, 'Cor inválida'),
  type: z.enum(['income', 'expense'], {
    errorMap: () => ({ message: 'Tipo inválido' }),
  }),
});

// ==================== Budget Schemas ====================

export const budgetSchema = z.object({
  category_id: z.string()
    .uuid('Categoria inválida')
    .min(1, 'Selecione uma categoria'),
  amount: z.number()
    .positive('Valor deve ser maior que zero')
    .max(999999999.99, 'Valor muito alto'),
  month: z.number()
    .int()
    .min(1, 'Mês inválido')
    .max(12, 'Mês inválido'),
  year: z.number()
    .int()
    .min(2020, 'Ano inválido')
    .max(2100, 'Ano inválido'),
});

// ==================== Type Exports ====================

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;
