import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabase';

// Extended Request type to inject user
declare global {
  namespace Express {
    interface Request {
      user?: any; // Use 'any' temporarily or Supabase User type
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

    // Verify if JWT is authentic with Supabase backend secret
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido ou expirado.' });
    }

    // Injects the logged user data INSIDE the request moving forward
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth Middleware Erro:', err);
    return res.status(500).json({ error: 'Erro interno na validação de autenticação.' });
  }
};
