import { Router } from 'express';
import transactionRoutes from './transactionRoutes';
import categoryRoutes from './categoryRoutes';

const router = Router();

// Rota de Healthcheck simples para verificar se a API está online
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Controle de Gastos API is running!' });
});

router.use('/categories', categoryRoutes);
router.use('/transactions', transactionRoutes);

export default router;
