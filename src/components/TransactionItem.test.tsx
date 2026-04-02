import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TransactionItem from './TransactionItem';
import type { Transaction } from '@/types';
import { api } from '@/services/api';

// Mock components and external dependencies
vi.mock('./ConfirmModal', () => ({
  default: ({ isOpen, onConfirm, onClose }: any) => isOpen ? (
    <div data-testid="confirm-modal">
      <button onClick={onConfirm}>Confirmar</button>
      <button onClick={onClose}>Cancelar</button>
    </div>
  ) : null,
}));

vi.mock('@/services/api', () => ({
  api: {
    delete: vi.fn(),
  }
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('TransactionItem', () => {
  const transaction: Transaction = {
    id: 't-123',
    description: 'Gasolina',
    amount: 250.50,
    date: '2026-03-10T00:00:00.000Z',
    type: 'expense',
    category_id: 'c-1',
    categories: {
      name: 'Transporte',
      color: '#ef4444',
      icon: 'car'
    },
    is_recurrent: false,
    frequency: null,
    user_id: 'u-123',
    created_at: ''
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar a descrição e o valor corretamente', () => {
    render(
      <TransactionItem 
        transaction={transaction} 
        onDelete={() => {}} 
        onEdit={() => {}} 
      />
    );

    expect(screen.getByText('Gasolina')).toBeInTheDocument();
    expect(screen.getByText(/250,50/)).toBeInTheDocument();
  });

  it('deve mostrar o ícone de repetição (Repeat) quando a transação for recorrente', () => {
    const recurrentTransaction = { ...transaction, is_recurrent: true };
    
    const { container } = render(
      <TransactionItem 
        transaction={recurrentTransaction} 
        onDelete={() => {}} 
        onEdit={() => {}} 
      />
    );

    const repeatIcon = container.querySelector('svg.text-blue-500');
    expect(repeatIcon).toBeInTheDocument();
  });

  it('não deve mostrar o ícone de repetição quando a transação não for recorrente', () => {
    const { container } = render(
      <TransactionItem 
        transaction={transaction} 
        onDelete={() => {}} 
        onEdit={() => {}} 
      />
    );

    const repeatIcon = container.querySelector('svg.text-blue-500');
    expect(repeatIcon).not.toBeInTheDocument();
  });

  it('deve chamar onDelete após exclusão bem-sucedida', async () => {
    const toast = await import('sonner');
    (api.delete as any).mockResolvedValue({ data: {} });
    
    const onDelete = vi.fn();
    render(<TransactionItem transaction={transaction} onDelete={onDelete} onEdit={() => {}} />);
    
    // Open modal
    fireEvent.click(screen.getByTitle('Excluir transação'));
    
    // Confirm
    const confirmButton = screen.getByText('Confirmar');
    fireEvent.click(confirmButton);
    
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/transactions/t-123');
      expect(toast.toast.success).toHaveBeenCalledWith('Transação excluída com sucesso!');
      expect(onDelete).toHaveBeenCalled();
    });
  });
});
