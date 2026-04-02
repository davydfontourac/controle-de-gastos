import { Router } from 'express';
import { deleteUser } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Protected route to delete the user itself
router.delete('/', authMiddleware, deleteUser);

export default router;
