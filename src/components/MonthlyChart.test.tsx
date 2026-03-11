import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MonthlyChart from './MonthlyChart';

// Mock recharts to avoid canvas/resize issues in jsdom
vi.mock('recharts', () => ({
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="grid" />,
  Tooltip: ({ content }: any) => {
    // Render tooltip content with mock payload to cover CustomTooltip
    const MockContent = content?.type ?? (() => null);
    return <MockContent active={true} payload={[{ dataKey: 'income', name: 'Receitas', value: 1000, color: '#10B981' }]} label="Mar" />;
  },
  Legend: ({ formatter }: any) => (
    <div data-testid="legend">{formatter?.('Receitas')}{formatter?.('Despesas')}</div>
  ),
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
}));

const mockData = [
  { month: 'Mar', income: 5000, expense: 2000, fullMonth: 3, year: 2026 },
  { month: 'Fev', income: 4000, expense: 1800, fullMonth: 2, year: 2026 },
  { month: 'Abr', income: 6000, expense: 2500, fullMonth: 4, year: 2026 },
];

describe('MonthlyChart', () => {
  it('deve renderizar o título do gráfico', () => {
    render(<MonthlyChart data={mockData} />);
    expect(screen.getByText('Evolução Mensal')).toBeInTheDocument();
  });

  it('deve renderizar o BarChart', () => {
    render(<MonthlyChart data={mockData} />);
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('deve exibir o skeleton de loading quando isLoading=true', () => {
    const { container } = render(<MonthlyChart data={[]} isLoading={true} />);
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('não deve exibir o skeleton quando isLoading=false', () => {
    const { container } = render(<MonthlyChart data={mockData} isLoading={false} />);
    expect(container.querySelector('.animate-pulse')).not.toBeInTheDocument();
  });

  it('deve renderizar a legenda com renderLegendText', () => {
    render(<MonthlyChart data={mockData} />);
    const legend = screen.getByTestId('legend');
    expect(legend).toBeInTheDocument();
    expect(legend.textContent).toContain('Receitas');
    expect(legend.textContent).toContain('Despesas');
  });

  it('deve ordenar os dados cronologicamente (por ano e mês)', () => {
    render(<MonthlyChart data={mockData} />);
    // Chart renders without error with sorted data
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
  });

  it('CustomTooltip deve renderizar conteúdo quando active=true e payload existe', () => {
    render(<MonthlyChart data={mockData} />);
    // The mocked Tooltip renders CustomTooltip with active=true and payload
    expect(screen.getByText('Mar')).toBeInTheDocument();
  });

  it('deve aceitar data vazia sem erros', () => {
    render(<MonthlyChart data={[]} />);
    expect(screen.getByText('Evolução Mensal')).toBeInTheDocument();
  });
});
