import { z } from 'zod';

// Validação para Criação/Edição de Categorias
export const categorySchema = z.object({
  name: z.string().min(1, 'O nome da categoria é obrigatório').max(255),
  color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor deve ser um HEX válido').optional(),
  icon: z.string().max(50).optional()
});

// Validação para Criação de Transações
export const createTransactionSchema = z.object({
  amount: z.number().positive('O valor da transação deve ser positivo e numérico.'),
  type: z.enum(['income', 'expense']),
  description: z.string().min(1, 'A descrição é obrigatória.').max(255),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Data inválida.' }),
  category_id: z.string().uuid('ID de categoria inválido.').optional().nullable(),
  is_recurrent: z.boolean().optional().default(false),
  frequency: z.enum(['weekly', 'monthly', 'yearly']).optional().nullable(),
  installments: z.number().int().min(1).max(60).optional().default(1),
});

// Validação para Atualização de Transações
export const updateTransactionSchema = z.object({
  amount: z.number().positive('O valor da transação deve ser positivo e numérico.').optional(),
  type: z.enum(['income', 'expense']).optional(),
  description: z.string().min(1, 'A descrição é obrigatória.').max(255).optional(),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: 'Data inválida.' }).optional(),
  category_id: z.string().uuid('ID de categoria inválido.').optional().nullable(),
  is_recurrent: z.boolean().optional(),
  frequency: z.enum(['weekly', 'monthly', 'yearly']).optional().nullable(),
  parent_id: z.string().uuid().optional().nullable(),
});
