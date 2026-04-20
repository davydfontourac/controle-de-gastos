import { authMiddleware } from './authMiddleware';
import { supabaseAdmin } from '../lib/supabase';
import { Request, Response, NextFunction } from 'express';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabase', () => ({
  supabaseAdmin: {
    auth: {
      getUser: vi.fn(),
    },
  },
}));

describe('authMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  const nextFunction: NextFunction = vi.fn();

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('retorna 401 sem token Bearer', async () => {
    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Nenhum token Bearer fornecido no cabeçalho Authorization.',
    });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('retorna 401 para token inválido', async () => {
    mockRequest.headers = { authorization: 'Bearer invalid_token' };
    (supabaseAdmin.auth.getUser as any).mockResolvedValue({
      data: { user: null },
      error: new Error('Invalid'),
    });

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token inválido ou expirado.' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('chama next() para token válido', async () => {
    const mockUser = { id: '123' };
    mockRequest.headers = { authorization: 'Bearer valid_token' };
    (supabaseAdmin.auth.getUser as any).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    await authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.user).toEqual(mockUser);
    expect(nextFunction).toHaveBeenCalled();
  });
});
