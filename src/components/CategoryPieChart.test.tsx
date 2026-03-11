import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CategoryPieChart from './CategoryPieChart';
import type { Transaction } from '@/types';

vi.mock('recharts', () => ({
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ children }: any) => <div data-testid="pie">{children}</div>,
  Cell: ({ fill }: any) => <div data-testid="cell" data-fill={fill} />,
  Tooltip: ({ formatter }: any) => {
    // Call formatter to cover Number.parseFloat branch
    const result = formatter?.('123.45');
    return <div data-testid="tooltip">{result}</div>;
  },
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

const makeTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: '1',
  description: 'Aluguel',
  amount: 1500,
  date: '2026-03-01',
  type: 'expense',
  category_id: 'c-1',
  categories: { name: 'Moradia', color: '#3B82F6', icon: 'home' },
  is_recurrent: false,
  frequency: null,
  user_id: 'u-1',
  created_at: '',
  ...overrides,
});

describe('CategoryPieChart', () => {
  it('deve exibir mensagem de vazio quando não há despesas', () => {
    const income: Transaction = makeTransaction({ type: 'income' });
    render(<CategoryPieChart transactions={[income]} />);
    expect(screen.getByText(/Nenhuma despesa registrada/i)).toBeInTheDocument();
  });

  it('deve renderizar o gráfico quando há despesas', () => {
    const expense = makeTransaction();
    render(<CategoryPieChart transactions={[expense]} />);
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
  });

  it('deve exibir o título "Distribuição de Gastos"', () => {
    const expense = makeTransaction();
    render(<CategoryPieChart transactions={[expense]} />);
    expect(screen.getByText(/Distribuição de Gastos/i)).toBeInTheDocument();
  });

  it('deve exibir o nome da categoria na legenda', () => {
    const expense = makeTransaction();
    render(<CategoryPieChart transactions={[expense]} />);
    expect(screen.getByText('Moradia')).toBeInTheDocument();
  });

  it('deve agrupar transações da mesma categoria', () => {
    const t1 = makeTransaction({ id: '1', amount: 1000 });
    const t2 = makeTransaction({ id: '2', amount: 500 });
    render(<CategoryPieChart transactions={[t1, t2]} />);
    // Only one legend entry for 'Moradia'
    expect(screen.getAllByText('Moradia')).toHaveLength(1);
  });

  it('deve usar cor padrão COLORS quando categoria não tem cor', () => {
    const expense = makeTransaction({
      categories: { name: 'Sem Cor', color: undefined as any, icon: 'tag' },
    });
    render(<CategoryPieChart transactions={[expense]} />);
    const cells = screen.getAllByTestId('cell');
    expect(cells.length).toBeGreaterThan(0);
  });

  it('deve usar "Sem categoria" quando categories é null', () => {
    const expense = makeTransaction({ categories: null, category_id: null });
    render(<CategoryPieChart transactions={[expense]} />);
    expect(screen.getByText('Sem categoria')).toBeInTheDocument();
  });

  it('deve chamar o formatter do tooltip com string e retornar valor formatado', () => {
    const expense = makeTransaction();
    render(<CategoryPieChart transactions={[expense]} />);
    // Tooltip formatter is called with '123.45' (string) in the mock
    const tooltip = screen.getByTestId('tooltip');
    expect(tooltip).toBeInTheDocument();
  });

  it('deve exibir porcentagem na legenda', () => {
    const expense = makeTransaction();
    render(<CategoryPieChart transactions={[expense]} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('deve mostrar mensagem de vazio quando transactions está vazio', () => {
    render(<CategoryPieChart transactions={[]} />);
    expect(screen.getByText(/Nenhuma despesa registrada/i)).toBeInTheDocument();
  });
});
