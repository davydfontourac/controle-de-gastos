import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTransactions } from './useTransactions';
import { api } from '@/services/api';
import { toast } from 'sonner';

vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
  }
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  }
}));

describe('useTransactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('inicia com estados padrão de lista vazia e zerado', () => {
    const { result } = renderHook(() => useTransactions());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.transactions).toEqual([]);
    expect(result.current.summary.balance).toBe(0);
    expect(result.current.history).toEqual([]);
  });

  it('busca as transações com sucesso aplicando os filtros na query', async () => {
    const mockTransactions = [{ id: 't1', amount: 100, type: 'income' }];
    const mockSummary = { income: 100, expense: 0, totalBalance: 100, yearBalance: 100 };
    const mockHistory = [{ month: 'Jan', value: 100 }];

    // Simulates Promise.all calls
    (api.get as any)
      .mockResolvedValueOnce({ data: mockTransactions }) // transRes
      .mockResolvedValueOnce({ data: mockSummary })      // sumRes
      .mockResolvedValueOnce({ data: mockHistory });     // historyRes

    const { result } = renderHook(() => useTransactions());

    await act(async () => {
      await result.current.fetchTransactions({ type: 'income', month: '10', year: '2023', search: 'teste' });
    });

    // Validate assembled query parameters
    expect(api.get).toHaveBeenNthCalledWith(1, '/transactions?type=income&month=10&year=2023&search=teste');
    expect(api.get).toHaveBeenNthCalledWith(2, '/transactions/summary?month=10&year=2023');
    expect(api.get).toHaveBeenNthCalledWith(3, '/transactions/history');

    expect(result.current.transactions).toEqual(mockTransactions);
    expect(result.current.summary.balance).toBe(100);
    expect(result.current.history).toEqual(mockHistory);
    expect(result.current.isLoading).toBe(false);
  });

  it('lida com falhas da api no meio do paralelismo', async () => {
    (api.get as any).mockRejectedValueOnce(new Error('Network error')); // Forces failure on Promise.all

    const { result } = renderHook(() => useTransactions());

    await act(async () => {
      await result.current.fetchTransactions({ type: 'all', month: '10', year: '2023', search: '' });
    });

    expect(toast.error).toHaveBeenCalledWith('Erro ao carregar transações');
    expect(result.current.isLoading).toBe(false);
  });
});
