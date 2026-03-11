import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';

// Extender a tipagem do Request para injetar o usuário
declare global {
  namespace Express {
    interface Request {
      user?: any; // Usar 'any' provisoriamente ou User type do Supabase
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Nenhum token Bearer fornecido no cabeçalho Authorization.' });
    }

    const token = authHeader.split(' ')[1];

    // Verificar se o JWT é autêntico com as secretas do Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }

    // Injeta o ID e dados do usuário logado DENTRO da requisição para frente
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Middleware Erro:', err);
    return res.status(500).json({ error: 'Erro interno na validação de autenticação.' });
  }
};
