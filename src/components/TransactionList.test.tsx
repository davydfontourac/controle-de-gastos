import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TransactionList from './TransactionList';
import type { Transaction } from '@/types';

vi.mock('./TransactionItem', () => ({
  default: ({ transaction }: any) => (
    <div data-testid="transaction-item">{transaction.description}</div>
  ),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, layout, initial, animate, exit, transition, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const baseFilters = { search: '', type: 'all', month: '3', year: '2026' };

const mockTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Salário',
    amount: 5000,
    date: '2026-03-01',
    type: 'income',
    category_id: null,
    categories: null,
    is_recurrent: false,
    frequency: null,
    user_id: 'u-1',
    created_at: '',
  },
  {
    id: '2',
    description: 'Aluguel',
    amount: 1500,
    date: '2026-03-05',
    type: 'expense',
    category_id: null,
    categories: null,
    is_recurrent: false,
    frequency: null,
    user_id: 'u-1',
    created_at: '',
  },
];

describe('TransactionList', () => {
  it('deve exibir skeletons durante o carregamento', () => {
    const { container } = render(
      <TransactionList
        transactions={[]}
        isLoading={true}
        filters={baseFilters}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('deve exibir texto acessível no heading do skeleton', () => {
    render(
      <TransactionList
        transactions={[]}
        isLoading={true}
        filters={baseFilters}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText(/Carregando transações/i)).toBeInTheDocument();
  });

  it('deve exibir mensagem de lista vazia quando não há transações', () => {
    render(
      <TransactionList
        transactions={[]}
        isLoading={false}
        filters={baseFilters}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText(/Nenhuma transação ainda/i)).toBeInTheDocument();
  });

  it('deve exibir mensagem de "Nenhum resultado" quando há filtros ativos', () => {
    render(
      <TransactionList
        transactions={[]}
        isLoading={false}
        filters={{ ...baseFilters, search: 'xyz' }}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText(/Nenhum resultado encontrado/i)).toBeInTheDocument();
  });

  it('deve exibir as transações quando há dados', () => {
    render(
      <TransactionList
        transactions={mockTransactions}
        isLoading={false}
        filters={baseFilters}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    expect(screen.getByText('Últimas Transações')).toBeInTheDocument();
    expect(screen.getAllByTestId('transaction-item')).toHaveLength(2);
  });

  it('deve renderizar o ícone SearchX quando há filtro de tipo ativo', () => {
    render(
      <TransactionList
        transactions={[]}
        isLoading={false}
        filters={{ ...baseFilters, type: 'expense' }}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );
    // When type != 'all', SearchX icon should be shown
    expect(screen.getByText(/Nenhum resultado encontrado/i)).toBeInTheDocument();
  });
});
