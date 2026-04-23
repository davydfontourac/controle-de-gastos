import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SummaryCards from './SummaryCards';

const baseSummary = {
  totalIncome: 5000,
  totalExpense: 2000,
  availableBalance: 3000,
  caixinhaBalance: 1500,
  yearBalance: 10000,
};

describe('SummaryCards', () => {
  it('deve renderizar os quatro cartões com os títulos corretos', () => {
    render(<SummaryCards summary={baseSummary} />);
    expect(screen.getByText('Disponível')).toBeInTheDocument();
    expect(screen.getByText('Caixinhas')).toBeInTheDocument();
    expect(screen.getByText('Receitas')).toBeInTheDocument();
    expect(screen.getByText('Despesas')).toBeInTheDocument();
  });

  it('deve exibir os valores formatados corretamente', () => {
    render(<SummaryCards summary={baseSummary} />);
    expect(screen.getByText(/R\$\s*3\.000/)).toBeInTheDocument(); // Disponível
    expect(screen.getByText(/R\$\s*1\.500/)).toBeInTheDocument(); // Caixinhas
    expect(screen.getByText(/R\$\s*5\.000/)).toBeInTheDocument(); // Receitas
    expect(screen.getByText(/R\$\s*2\.000/)).toBeInTheDocument(); // Despesas
  });

  it('deve exibir o Patrimônio Total (soma de disponível + caixinha)', () => {
    render(<SummaryCards summary={baseSummary} />);
    expect(screen.getByText(/Patrimônio Total/i)).toBeInTheDocument();
    // 3000 + 1500 = 4500
    expect(screen.getByText(/R\$\s*4\.500/)).toBeInTheDocument();
  });

  it('deve aplicar classe verde quando Patrimonio Total >= 0', () => {
    const { container } = render(<SummaryCards summary={{ ...baseSummary, availableBalance: 500, caixinhaBalance: 0 }} />);
    const greenSpan = container.querySelector('.text-emerald-500, .text-emerald-400');
    expect(greenSpan).toBeInTheDocument();
  });

  it('deve aplicar classe vermelha quando Patrimonio Total < 0', () => {
    const { container } = render(<SummaryCards summary={{ ...baseSummary, availableBalance: -1000, caixinhaBalance: 200 }} />);
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
