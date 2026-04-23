import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';
import { useAuth } from '@/context/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: vi.fn()
}));

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn()
}));

// Mocks for components to avoid rendering deep trees
vi.mock('@/components/SummaryCards', () => ({ default: () => <div data-testid="summary-cards" /> }));
vi.mock('@/components/TransactionFilters', () => ({ default: () => <div data-testid="filters" /> }));
vi.mock('@/components/TransactionList', () => ({ default: () => <div data-testid="list" /> }));
vi.mock('@/components/CategoryPieChart', () => ({ default: () => <div data-testid="pie" /> }));
vi.mock('@/components/MonthlyChart', () => ({ default: () => <div data-testid="monthly" /> }));
vi.mock('@/components/BottomNavigation', () => ({ default: () => <div data-testid="bottom-nav" /> }));
vi.mock('@/components/PageTransition', () => ({ default: ({ children }: any) => <div>{children}</div> }));

describe('Dashboard', () => {
  beforeEach(() => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', email: 'test@test.com' },
      profile: { full_name: 'Test User' },
      signOut: vi.fn()
    });

    (useTransactions as any).mockReturnValue({
      transactions: [],
      summary: {},
      history: [],
      isLoading: false,
      fetchTransactions: vi.fn(),
      deleteTransactionsByMonth: vi.fn()
    });
  });

  it('deve abrir o menu flutuante (FAB) ao clicar', () => {
    render(<Dashboard />);
    
    // Procura o botão principal do FAB pelo ícone ou classe
    const mainFabButton = screen.getAllByRole('button').find(b => b.className.includes('bg-blue-600'));
    
    expect(mainFabButton).toBeInTheDocument();
    
    // Clica para abrir o menu
    fireEvent.click(mainFabButton!);
    
    // Verifica se os botões do menu apareceram (Nova Transação, Importar CSV)
    expect(screen.getByText('Nova Transação')).toBeInTheDocument();
    expect(screen.getByText('Importar CSV')).toBeInTheDocument();
    expect(screen.getByText('Gerenciar Categorias')).toBeInTheDocument();
  });
});
