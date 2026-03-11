import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TransactionFilters from './TransactionFilters';

const defaultFilters = {
  search: '',
  type: 'all',
  month: '3',
  year: '2026',
};

const defaultProps = {
  onSearchChange: vi.fn(),
  onTypeChange: vi.fn(),
  onMonthChange: vi.fn(),
  onYearChange: vi.fn(),
  filters: defaultFilters,
};

describe('TransactionFilters', () => {
  it('deve renderizar o campo de busca', () => {
    render(<TransactionFilters {...defaultProps} />);
    expect(screen.getByPlaceholderText(/Buscar por descrição/i)).toBeInTheDocument();
  });

  it('deve exibir os botões Todos, Receitas e Despesas', () => {
    render(<TransactionFilters {...defaultProps} />);
    expect(screen.getByText('Todos')).toBeInTheDocument();
    expect(screen.getByText('Receitas')).toBeInTheDocument();
    expect(screen.getByText('Despesas')).toBeInTheDocument();
  });

  it('deve chamar onSearchChange ao digitar na busca', () => {
    const onSearchChange = vi.fn();
    render(<TransactionFilters {...defaultProps} onSearchChange={onSearchChange} />);
    fireEvent.change(screen.getByPlaceholderText(/Buscar por descrição/i), {
      target: { value: 'supermercado' },
    });
    expect(onSearchChange).toHaveBeenCalledWith('supermercado');
  });

  it('deve chamar onTypeChange ao clicar em Receitas', () => {
    const onTypeChange = vi.fn();
    render(<TransactionFilters {...defaultProps} onTypeChange={onTypeChange} />);
    fireEvent.click(screen.getByText('Receitas'));
    expect(onTypeChange).toHaveBeenCalledWith('income');
  });

  it('deve chamar onTypeChange ao clicar em Despesas', () => {
    const onTypeChange = vi.fn();
    render(<TransactionFilters {...defaultProps} onTypeChange={onTypeChange} />);
    fireEvent.click(screen.getByText('Despesas'));
    expect(onTypeChange).toHaveBeenCalledWith('expense');
  });

  it('deve chamar onTypeChange ao clicar em Todos', () => {
    const onTypeChange = vi.fn();
    render(<TransactionFilters {...defaultProps} onTypeChange={onTypeChange} />);
    fireEvent.click(screen.getByText('Todos'));
    expect(onTypeChange).toHaveBeenCalledWith('all');
  });

  it('deve render os selects de mês e ano', () => {
    render(<TransactionFilters {...defaultProps} />);
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
  });

  it('deve chamar onMonthChange ao trocar o mês', () => {
    const onMonthChange = vi.fn();
    render(<TransactionFilters {...defaultProps} onMonthChange={onMonthChange} />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[0], { target: { value: '6' } });
    expect(onMonthChange).toHaveBeenCalledWith('6');
  });

  it('deve chamar onYearChange ao trocar o ano', () => {
    const onYearChange = vi.fn();
    render(<TransactionFilters {...defaultProps} onYearChange={onYearChange} />);
    const selects = screen.getAllByRole('combobox');
    fireEvent.change(selects[1], { target: { value: '2025' } });
    expect(onYearChange).toHaveBeenCalledWith('2025');
  });
});
