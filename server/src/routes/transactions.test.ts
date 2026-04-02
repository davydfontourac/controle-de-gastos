import request from 'supertest';
import { app } from '../index';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabaseAdmin } from '../lib/supabase';

vi.mock('../middlewares/authMiddleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => {
    // Injects fake user bypassing JWT validation to focus on routes
    req.user = { id: 'user-123' };
    next();
  }
}));

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    from: vi.fn(),
  }
}));

describe('Transactions API', () => {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn(),
    update: vi.fn().mockReturnThis(),
    match: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (supabaseAdmin.from as any).mockReturnValue(mockChain);
  });

  describe('GET /api/transactions', () => {
    it('retorna a lista de transações do usuário', async () => {
      const mockData = [{ id: '1', amount: 100, description: 'Salário' }];
      // Supabase query ends with resolve on the query promise, we mock the last chain return
      mockChain.order.mockResolvedValue({ data: mockData, error: null });

      const response = await request(app).get('/api/transactions');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(supabaseAdmin.from).toHaveBeenCalledWith('transactions');
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', 'user-123');
    });

    it('retorna 500 se o Supabase falhar', async () => {
      mockChain.order.mockResolvedValue({ data: null, error: { message: 'DB Error' } });

      const response = await request(app).get('/api/transactions');
      
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'DB Error' });
    });
  });

  describe('POST /api/transactions', () => {
    it('cria transação com payload válido (validação Zod passa)', async () => {
      const payload = { 
        description: 'Venda', 
        amount: 500, 
        date: new Date().toISOString(), 
        category_id: '35ec8fb8-2287-4aa7-94d5-fb40bb5fa324', 
        type: 'income' 
      };
      const createdRecord = { id: '2', ...payload, user_id: 'user-123' };
      
      mockChain.single.mockResolvedValue({ data: createdRecord, error: null });

      const response = await request(app).post('/api/transactions').send(payload);
      
      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdRecord);
      expect(mockChain.insert).toHaveBeenCalled();
    });

    it('retorna 400 Bad Request se a validação Zod falhar', async () => {
      const invalidPayload = { amount: 500 }; // missing required keys like type, req, etc.
      
      const response = await request(app).post('/api/transactions').send(invalidPayload);
      
      expect(response.status).toBe(400);
      expect(mockChain.insert).not.toHaveBeenCalled();
    });
  });

  describe('PUT /api/transactions/:id', () => {
    it('atualiza uma transação existente com permissão', async () => {
      const updatePayload = { description: 'Compras Mês' };
      const expectedReturn = { id: '1', description: 'Compras Mês' };

      mockChain.single.mockResolvedValue({ data: expectedReturn, error: null });

      const response = await request(app).put('/api/transactions/1').send(updatePayload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(expectedReturn);
      expect(mockChain.match).toHaveBeenCalledWith({ id: '1', user_id: 'user-123' });
    });

    it('retorna 404 caso transação não exista ou seja de outro usuário', async () => {
      mockChain.single.mockResolvedValue({ data: null, error: null }); // Single returns null if not found
      
      const response = await request(app).put('/api/transactions/1').send({ description: 'Ghost' });
      
      expect(response.status).toBe(404);
      expect(response.body.error).toMatch(/não encontrada/);
    });
  });

  describe('DELETE /api/transactions/:id', () => {
    it('deleta transação com sucesso', async () => {
      // Mock for DELETE with exact count success
      mockChain.match.mockResolvedValue({ error: null, count: 1 });

      const response = await request(app).delete('/api/transactions/1');

      expect(response.status).toBe(204);
      expect(mockChain.delete).toHaveBeenCalledWith({ count: 'exact' });
    });

    it('retorna 404 para exclusão inexistente', async () => {
      mockChain.match.mockResolvedValue({ error: null, count: 0 });

      const response = await request(app).delete('/api/transactions/999');

      expect(response.status).toBe(404);
    });
  });
});
