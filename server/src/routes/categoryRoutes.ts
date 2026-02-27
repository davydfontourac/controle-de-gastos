import { Router } from 'express';
import { categoryController } from '../controllers/categoryController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware as any);

router.get('/', categoryController.getAll as any);
router.post('/', categoryController.create as any);
router.put('/:id', categoryController.update as any);
router.delete('/:id', categoryController.delete as any);

export default router;
