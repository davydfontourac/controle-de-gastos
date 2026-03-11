import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SummaryCards from './SummaryCards';

const baseSummary = {
  totalIncome: 5000,
  totalExpense: 2000,
  balance: 3000,
  yearBalance: 10000,
};

describe('SummaryCards', () => {
  it('deve renderizar os três cartões com os títulos corretos', () => {
    render(<SummaryCards summary={baseSummary} />);
    expect(screen.getByText('Saldo Total')).toBeInTheDocument();
    expect(screen.getByText('Receitas')).toBeInTheDocument();
    expect(screen.getByText('Despesas')).toBeInTheDocument();
  });

  it('deve exibir os valores formatados corretamente', () => {
    render(<SummaryCards summary={baseSummary} />);
    expect(screen.getByText(/R\$\s*3\.000/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*5\.000/)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*2\.000/)).toBeInTheDocument();
  });

  it('deve exibir o valor acumulado no ano (subValue) para o cartão de Saldo', () => {
    render(<SummaryCards summary={baseSummary} />);
    expect(screen.getByText(/Acumulado no ano/i)).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*10\.000/)).toBeInTheDocument();
  });

  it('deve aplicar classe verde quando yearBalance >= 0', () => {
    const { container } = render(<SummaryCards summary={{ ...baseSummary, yearBalance: 500 }} />);
    const greenSpan = container.querySelector('.text-emerald-500, .text-emerald-400');
    expect(greenSpan).toBeInTheDocument();
  });

  it('deve aplicar classe vermelha quando yearBalance < 0', () => {
    const { container } = render(<SummaryCards summary={{ ...baseSummary, yearBalance: -100 }} />);
    const redSpan = container.querySelector('.text-red-500, .text-red-400');
    expect(redSpan).toBeInTheDocument();
  });

  it('deve exibir skeletons quando isLoading=true', () => {
    const { container } = render(<SummaryCards summary={baseSummary} isLoading={true} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('não deve exibir skeletons quando isLoading=false', () => {
    const { container } = render(<SummaryCards summary={baseSummary} isLoading={false} />);
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBe(0);
  });

  it('deve usar bgAccentClass azul para o cartão de Saldo (blue)', () => {
    const { container } = render(<SummaryCards summary={baseSummary} />);
    expect(container.innerHTML).toContain('bg-blue-600');
  });

  it('deve usar bgAccentClass verde para o cartão de Receitas (emerald)', () => {
    const { container } = render(<SummaryCards summary={baseSummary} />);
    expect(container.innerHTML).toContain('bg-emerald-600');
  });

  it('deve usar bgAccentClass vermelho para o cartão de Despesas (red)', () => {
    const { container } = render(<SummaryCards summary={baseSummary} />);
    expect(container.innerHTML).toContain('bg-red-600');
  });
});
