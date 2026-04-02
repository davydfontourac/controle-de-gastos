import { Router } from 'express';
import transactionRoutes from './transactionRoutes';
import categoryRoutes from './categoryRoutes';
import userRoutes from './userRoutes';

const router = Router();

// Simple Healthcheck route to verify if the API is online
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Controle de Gastos API is running!' });
});

router.use('/categories', categoryRoutes);
router.use('/transactions', transactionRoutes);
router.use('/users', userRoutes);

export default router;
