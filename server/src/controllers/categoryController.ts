import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';
import { categorySchema } from '../utils/validators';

interface AuthRequest extends Request {
  user?: any;
}

export const categoryController = {
  // GET /categories
  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;

      const { data, error } = await supabaseAdmin
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST /categories
  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      
      // Validação ZOD
      const parsedBody = categorySchema.parse(req.body);

      const { data, error } = await supabaseAdmin
        .from('categories')
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

  // DELETE /categories/:id
  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { error, count } = await supabaseAdmin
        .from('categories')
        .delete({ count: 'exact' })
        .match({ id, user_id: userId });

      if (error) throw error;
      if (count === 0) return res.status(404).json({ error: 'Categoria não encontrada ou permissão negada.' });

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
