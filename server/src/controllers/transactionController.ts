import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { createTransactionSchema, updateTransactionSchema } from '../utils/validators';

// Helper tipado
interface AuthRequest extends Request {
  user?: any;
}

export const transactionController = {
  // GET /transactions
  async getAll(req: AuthRequest, res: Response) {
    try {
      const { type, month, year, search } = req.query;
      const userId = req.user.id;

      let query = supabaseAdmin
        .from('transactions')
        .select('*, categories(name, icon, color)')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      if (search) {
        query = query.ilike('description', `%${search}%`);
      }

      // Filtros básicos de mês/ano
      if (month && year) {
        const startDate = new Date(Number(year), Number(month) - 1, 1).toISOString();
        const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59).toISOString();
        query = query.gte('date', startDate).lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Helper para gerar datas de recorrência
  _generateRecurringTransactions(parsedBody: any, userId: string) {
    const { frequency, installments = 1, date: startDateStr, ...rest } = parsedBody;
    const baseDate = new Date(startDateStr);
    
    return Array.from({ length: installments }).map((_, i) => {
      const currentDate = new Date(baseDate);
      
      if (frequency === 'weekly') currentDate.setUTCDate(baseDate.getUTCDate() + (i * 7));
      if (frequency === 'monthly') currentDate.setUTCMonth(baseDate.getUTCMonth() + i);
      if (frequency === 'yearly') currentDate.setUTCFullYear(baseDate.getUTCFullYear() + i);

      return {
        ...rest,
        date: currentDate.toISOString(),
        user_id: userId,
        is_recurrent: true,
        frequency,
      };
    });
  },

  // POST /transactions
  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const parsedBody = createTransactionSchema.parse(req.body);
      
      const { is_recurrent, frequency, installments = 1 } = parsedBody;

      // Caso 1: Transação Única
      if (!is_recurrent || !frequency || installments <= 1) {
        const { data, error } = await supabaseAdmin
          .from('transactions')
          .insert([{ ...parsedBody, user_id: userId }])
          .select('*, categories(name, icon, color)')
          .single();

        if (error) throw error;
        return res.status(201).json(data);
      }

      // Caso 2: Transações Recorrentes (Materialização)
      const transactionsToInsert = transactionController._generateRecurringTransactions(parsedBody, userId);

      const { data: firstRecord, error: firstError } = await supabaseAdmin
        .from('transactions')
        .insert([transactionsToInsert[0]])
        .select()
        .single();

      if (firstError) throw firstError;

      // Inserir parcelas restantes vinculadas ao parent_id
      const otherTransactions = transactionsToInsert.slice(1).map(t => ({
        ...t,
        parent_id: firstRecord.id
      }));

      const { error: othersError } = await supabaseAdmin
        .from('transactions')
        .insert(otherTransactions);

      if (othersError) throw othersError;

      // Retornar a primeira com categorias
      const { data: finalData, error: finalError } = await supabaseAdmin
        .from('transactions')
        .select('*, categories(name, icon, color)')
        .eq('id', firstRecord.id)
        .single();

      if (finalError) throw finalError;
      return res.status(201).json(finalData);

    } catch (error: any) {
      const status = error.name === 'ZodError' ? 400 : 500;
      const message = error.name === 'ZodError' ? error.errors : error.message;
      res.status(status).json({ error: message });
    }
  },

  // PUT /transactions/:id
  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      // Validação Zod com campos opcionais
      const parsedUpdates = updateTransactionSchema.parse(req.body);

      // Importante: garante edição APENAS se o userID bater com o token
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .update(parsedUpdates)
        .match({ id, user_id: userId })
        .select('*, categories(name, icon, color)')
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Transação não encontrada ou sem permissão.' });

      res.json(data);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // DELETE /transactions/:id
  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { error, count } = await supabaseAdmin
        .from('transactions')
        .delete({ count: 'exact' })
        .match({ id, user_id: userId });

      if (error) throw error;
      if (count === 0) return res.status(404).json({ error: 'Transação não encontrada ou sem permissão.' });

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET /transactions/summary?month=X&year=Y
async getSummary(req: AuthRequest, res: Response) {
  try {
    const { month, year } = req.query;
    const userId = req.user.id;

    // 1. Saldo Acumulado (All-time)
    const { data: allData, error: allError } = await supabaseAdmin
      .from('transactions')
      .select('amount, type')
      .eq('user_id', userId);

    if (allError) throw allError;

    let totalBalance = 0;
    allData.forEach(t => {
      if (t.type === 'income') totalBalance += Number(t.amount);
      if (t.type === 'expense') totalBalance -= Number(t.amount);
    });

    // 2. Saldo do Ano Selecionado
    let yearBalance = 0;
    if (year) {
      const yearStart = new Date(Date.UTC(Number(year), 0, 1)).toISOString();
      const yearEnd = new Date(Date.UTC(Number(year), 11, 31, 23, 59, 59)).toISOString();
      
      const { data: yearData, error: yearError } = await supabaseAdmin
        .from('transactions')
        .select('amount, type')
        .eq('user_id', userId)
        .gte('date', yearStart)
        .lte('date', yearEnd);

      if (yearError) throw yearError;
      
      yearData.forEach(t => {
        if (t.type === 'income') yearBalance += Number(t.amount);
        if (t.type === 'expense') yearBalance -= Number(t.amount);
      });
    }

    // 3. Resumo Mensal (Filtrado)
    let income = 0;
    let expense = 0;
    if (month && year) {
      const startDate = new Date(Date.UTC(Number(year), Number(month) - 1, 1)).toISOString();
      const endDate = new Date(Date.UTC(Number(year), Number(month), 0, 23, 59, 59)).toISOString();
      
      const { data: monthData, error: monthError } = await supabaseAdmin
        .from('transactions')
        .select('amount, type')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate);

      if (monthError) throw monthError;

      monthData.forEach(t => {
        if (t.type === 'income') income += Number(t.amount);
        if (t.type === 'expense') expense += Number(t.amount);
      });
    }

    res.json({ 
      income, 
      expense, 
      totalBalance,
      yearBalance,
      balance: totalBalance // Compatibilidade com frontend anterior
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
},

  // GET /transactions/history
  async getHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const history = [];
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      const today = new Date();
      const currentYear = today.getFullYear();

      // Loop de Janeiro até Dezembro
      for (let i = 0; i <= 11; i++) {
        const month = i + 1;
        
        // Datas em UTC para evitar problemas de fuso horário
        const startDate = new Date(Date.UTC(currentYear, i, 1)).toISOString();
        const endDate = new Date(Date.UTC(currentYear, i + 1, 0, 23, 59, 59)).toISOString();

        const { data, error } = await supabaseAdmin
          .from('transactions')
          .select('amount, type')
          .eq('user_id', userId)
          .gte('date', startDate)
          .lte('date', endDate);

        if (error) throw error;

        let income = 0;
        let expense = 0;

        data.forEach(t => {
          if (t.type === 'income') income += Number(t.amount);
          if (t.type === 'expense') expense += Number(t.amount);
        });

        history.push({
          month: monthNames[i],
          income: Number(income.toFixed(2)),
          expense: Number(expense.toFixed(2)),
          fullMonth: month,
          year: currentYear
        });
      }

      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
