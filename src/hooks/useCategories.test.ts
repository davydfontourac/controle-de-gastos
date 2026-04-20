import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCategories } from './useCategories';
import { supabase } from '@/services/supabase';
import { toast } from 'sonner';

const mockQuery = {
  select: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  then: vi.fn(),
};

vi.mock('@/services/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockQuery),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe('useCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inicia no estado loading', () => {
    const { result } = renderHook(() => useCategories());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.categories).toEqual([]);
  });

  it('carrega categorias com sucesso', async () => {
    const mockCategories = [{ id: '1', name: 'Alimentação', icon: 'food', color: '#ff0000' }];

    mockQuery.then.mockImplementationOnce((callback) => callback({ data: mockCategories, error: null }));

    const { result } = renderHook(() => useCategories());

    await act(async () => {
      await result.current.fetchCategories();
    });

    expect(supabase.from).toHaveBeenCalledWith('categories');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.categories).toEqual(mockCategories);
  });

  it('lida com erro na chamada do supabase utilizando toast', async () => {
    mockQuery.then.mockImplementationOnce((callback) => callback({ data: null, error: new Error('API Error') }));

    const { result } = renderHook(() => useCategories());

    await act(async () => {
      await result.current.fetchCategories();
    });

    expect(toast.error).toHaveBeenCalledWith('Erro ao carregar categorias');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.categories).toEqual([]);
  });
});
