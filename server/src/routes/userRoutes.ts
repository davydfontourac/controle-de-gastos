import { Router } from 'express';
import { deleteUser } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Rota protegida para excluir o próprio usuário
router.delete('/', authMiddleware, deleteUser);

export default router;
