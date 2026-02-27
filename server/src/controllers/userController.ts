import { Request, Response } from 'express';
import { supabaseAdmin } from '../lib/supabase';

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    // Deleta o usuário do Supabase Auth
    // Isso disparará o ON DELETE CASCADE nas tabelas vinculadas (profiles, categories, transactions)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error('Erro ao excluir usuário no Supabase:', error.message);
      return res.status(500).json({ error: 'Erro ao excluir conta do usuário.' });
    }

    return res.status(200).json({ message: 'Conta excluída com sucesso.' });
  } catch (err) {
    console.error('UserController Delete Error:', err);
    return res.status(500).json({ error: 'Erro interno ao tentar excluir a conta.' });
  }
};
