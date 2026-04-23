import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ImportPreview from './ImportPreview';

const mockCategories = [
  { id: '1', name: 'Mercado', color: 'blue', icon: 'cart' },
  { id: '2', name: 'Transporte', color: 'red', icon: 'car' },
];

const mockTransactions = [
  {
    date: '2026-04-23',
    description: 'Uber',
    amount: 25.50,
    type: 'expense' as const,
    category_id: '2',
  },
  {
    date: '2026-04-24',
    description: 'Salário',
    amount: 5000,
    type: 'income' as const,
    category_id: null,
  }
];

describe('ImportPreview', () => {
  it('deve renderizar o resumo e a tabela corretamente', () => {
    const onChangeMock = vi.fn();
    render(<ImportPreview transactions={mockTransactions} categories={mockCategories} onTransactionsChange={onChangeMock} />);

    expect(screen.getByText('Total Receitas')).toBeInTheDocument();
    expect(screen.getAllByText(/R\$\s*5\.000,00/)).toHaveLength(2);
    
    expect(screen.getByText('Uber')).toBeInTheDocument();
    expect(screen.getByText('Salário')).toBeInTheDocument();
  });

  it('deve permitir alterar a categoria de uma transação na tabela', () => {
    const onChangeMock = vi.fn();
    render(<ImportPreview transactions={mockTransactions} categories={mockCategories} onTransactionsChange={onChangeMock} />);

    // Select input for the second transaction (Salário)
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(2);

    fireEvent.change(selects[1], { target: { value: '1' } });

    expect(onChangeMock).toHaveBeenCalledWith([
      mockTransactions[0],
      { ...mockTransactions[1], category_id: '1' }
    ]);
  });
});
