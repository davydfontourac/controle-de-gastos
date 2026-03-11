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

      const { data: existingCategories, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name', { ascending: true });

    if (error) throw error;

    const defaultCategories = [
      // Receitas
      { name: 'Salário', icon: 'banknote', color: '#10B981', user_id: userId },
      { name: 'Investimentos', icon: 'trending-up', color: '#059669', user_id: userId },
      
      // Essenciais
      { name: 'Moradia', icon: 'home', color: '#3B82F6', user_id: userId },
      { name: 'Conta de Luz', icon: 'zap', color: '#F59E0B', user_id: userId },
      { name: 'Conta de Água', icon: 'droplets', color: '#06B6D4', user_id: userId },
      { name: 'Internet', icon: 'wifi', color: '#6366F1', user_id: userId },
      { name: 'Supermercado', icon: 'shopping-cart', color: '#8B5CF6', user_id: userId },
      
      // Estilo de Vida
      { name: 'Alimentação', icon: 'utensils', color: '#EF4444', user_id: userId },
      { name: 'Transporte', icon: 'car', color: '#6B7280', user_id: userId },
      { name: 'Lazer', icon: 'clapperboard', color: '#F472B6', user_id: userId },
      { name: 'Saúde', icon: 'heart', color: '#10B981', user_id: userId },
      { name: 'Educação', icon: 'graduation-cap', color: '#4F46E5', user_id: userId },
      { name: 'Assinaturas', icon: 'tv', color: '#EC4899', user_id: userId },
      { name: 'Vestuário', icon: 'shirt', color: '#D946EF', user_id: userId },
    ];

    // Só insere categorias padrão se o usuário não tiver NENHUMA categoria cadastrada
    if (existingCategories?.length === 0) {
      const { error: seedError } = await supabaseAdmin
        .from('categories')
        .insert(defaultCategories);

      if (seedError) throw seedError;

      // Buscar novamente após a inserção para retornar a lista inicial
      const { data: newData, error: fetchError } = await supabaseAdmin
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;
      return res.json(newData || []);
    }

    res.json(existingCategories || []);
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
  },

  // PUT /categories/:id
  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const parsedBody = categorySchema.parse(req.body);

      const { data, error } = await supabaseAdmin
        .from('categories')
        .update(parsedBody)
        .match({ id, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: 'Categoria não encontrada.' });

      res.json(data);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  }
};
