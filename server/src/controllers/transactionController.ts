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

  // POST /transactions
  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      
      // Validações pesadas no momento em que os dados batem
      const parsedBody = createTransactionSchema.parse(req.body);

      const { data, error } = await supabaseAdmin
        .from('transactions')
        .insert([{ ...parsedBody, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
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
        .select()
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

      let query = supabaseAdmin
        .from('transactions')
        .select('amount, type')
        .eq('user_id', userId);

      if (month && year) {
        const startDate = new Date(Number(year), Number(month) - 1, 1).toISOString();
        const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59).toISOString();
        query = query.gte('date', startDate).lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      let income = 0;
      let expense = 0;

      data.forEach(t => {
        if (t.type === 'income') income += Number(t.amount);
        if (t.type === 'expense') expense += Number(t.amount);
      });

      const total = income - expense;

      res.json({ income, expense, total });
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

      // Loop para buscar os últimos 6 meses (incluindo o atual)
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setDate(1); // Evita problemas de transbordo em meses curtos
        date.setMonth(date.getMonth() - i);
        
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        const startDate = new Date(year, month - 1, 1).toISOString();
        const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

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
          month: monthNames[month - 1],
          income: Number(income.toFixed(2)),
          expense: Number(expense.toFixed(2)),
          fullMonth: month,
          year
        });
      }

      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
