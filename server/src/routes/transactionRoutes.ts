import { Router } from 'express';
import { transactionController } from '../controllers/transactionController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Aplica a Barreira do JWT em todas as rotas deste arquivo
router.use(authMiddleware as any);

router.get('/summary', transactionController.getSummary as any);
router.get('/history', transactionController.getHistory as any);
router.get('/', transactionController.getAll as any);
router.post('/', transactionController.create as any);
router.put('/:id', transactionController.update as any);
router.delete('/:id', transactionController.delete as any);

export default router;
