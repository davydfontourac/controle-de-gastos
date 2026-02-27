import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

// Helper tipado
interface AuthRequest extends Request {
  user?: any;
}

export const transactionController = {
  // GET /transactions
  async getAll(req: AuthRequest, res: Response) {
    try {
      const { type, month, year } = req.query;
      const userId = req.user.id;

      let query = supabaseAdmin
        .from('transactions')
        .select('*, categories(name, icon, color)')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      // Filtros básicos de mês/ano (opcional base para depois)
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
      const { amount, type, description, date, category_id } = req.body;

      if (!amount || !type || !description || !date) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
      }

      const { data, error } = await supabaseAdmin
        .from('transactions')
        .insert([{ amount, type, description, date, category_id, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // PUT /transactions/:id
  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updates = req.body;

      // Importante: garante edição APENAS se o userID bater com o token
      const { data, error } = await supabaseAdmin
        .from('transactions')
        .update(updates)
        .match({ id, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Transação não encontrada ou sem permissão.' });

      res.json(data);
    } catch (error: any) {
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

  // GET /transactions/summary
  async getSummary(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('transactions')
        .select('amount, type')
        .eq('user_id', userId);

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
  }
};
