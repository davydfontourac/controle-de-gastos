import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from './Dashboard';
import { useAuth } from '@/context/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import { usePrivacy } from '@/context/PrivacyContext';

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/context/PrivacyContext', () => ({
  usePrivacy: vi.fn(),
}));

vi.mock('@/hooks/useTransactions', () => ({
  useTransactions: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
  useSearchParams: () => [new URLSearchParams()],
}));

// Mocks for components to avoid rendering deep trees
vi.mock('@/components/SummaryCards', () => ({
  default: () => <div data-testid="summary-cards" />,
}));
vi.mock('@/components/TransactionFilters', () => ({
  default: ({ onSearchChange, onTypeChange, onMonthChange, onYearChange, onClearMonth }: any) => (
    <div data-testid="filters">
      <button onClick={() => onSearchChange('test')}>Search</button>
      <button onClick={() => onTypeChange('income')}>Type</button>
      <button onClick={() => onMonthChange('1')}>Month</button>
      <button onClick={() => onYearChange('2026')}>Year</button>
      <button onClick={() => onClearMonth()}>Clear</button>
    </div>
  ),
}));
vi.mock('@/components/TransactionList', () => ({
  default: ({ onDelete, onEdit }: any) => (
    <div data-testid="list">
      <button onClick={() => onDelete('1')}>Delete</button>
      <button onClick={() => onEdit({ id: '1' })}>Edit</button>
    </div>
  ),
}));
vi.mock('@/components/CategoryPieChart', () => ({ default: () => <div data-testid="pie" /> }));
vi.mock('@/components/MonthlyChart', () => ({ default: () => <div data-testid="monthly" /> }));
vi.mock('@/components/BottomNavigation', () => ({
  default: () => <div data-testid="bottom-nav" />,
}));
vi.mock('@/components/PageTransition', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('@/components/ImportWizard/ImportWizard', () => ({
  default: ({ isOpen, onClose, onSuccess }: any) =>
    isOpen ? (
      <div data-testid="import-wizard">
        <button onClick={onClose}>Close Import</button>
        <button onClick={onSuccess}>Success Import</button>
      </div>
    ) : null,
}));
vi.mock('@/components/TransactionForm', () => ({
  default: ({ isOpen, onClose, onSuccess }: any) =>
    isOpen ? (
      <div data-testid="transaction-form">
        <button onClick={onClose}>Close Form</button>
        <button onClick={onSuccess}>Success Form</button>
      </div>
    ) : null,
}));

describe('Dashboard', () => {
  beforeEach(() => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', email: 'test@test.com' },
      profile: { full_name: 'Test User' },
      signOut: vi.fn(),
    });

    (usePrivacy as any).mockReturnValue({
      hideBalance: false,
      setHideBalance: vi.fn(),
    });

    (useTransactions as any).mockReturnValue({
      transactions: [],
      summary: {},
      history: [],
      isLoading: false,
      fetchTransactions: vi.fn(),
      deleteTransactionsByMonth: vi.fn(),
    });
  });

  it('deve exibir os botões de ação no cabeçalho', () => {
    render(<Dashboard />);
    expect(screen.getByText('Nova transação')).toBeInTheDocument();
    expect(screen.getByText('Importar CSV')).toBeInTheDocument();
    expect(screen.getByText('Gerenciar Categorias')).toBeInTheDocument();
  });

  it('deve lidar com callbacks dos filtros', async () => {
    render(<Dashboard />);

    // Test search input
    const searchInput = screen.getByPlaceholderText('Buscar por descrição...');
    fireEvent.change(searchInput, { target: { value: 'teste' } });
    expect(searchInput).toHaveValue('teste');

    // Test Limpar filtros
    fireEvent.click(screen.getByText('Limpar filtros'));
    expect(searchInput).toHaveValue('');
  });

  it('deve lidar com callbacks da lista', () => {
    (useTransactions as any).mockReturnValue({
      transactions: [
        { id: '1', description: 'Mercado', amount: 100, date: '2026-04-01', type: 'expense' },
      ],
      summary: {},
      history: [],
      isLoading: false,
      fetchTransactions: vi.fn(),
      deleteTransactionsByMonth: vi.fn(),
    });

    render(<Dashboard />);

    // Clica na transação para editar
    fireEvent.click(screen.getByText('Mercado'));
    expect(screen.getByTestId('transaction-form')).toBeInTheDocument();
  });

  it('deve lidar com o botão de nova transação e modal', async () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByText('Nova transação'));
    await waitFor(() => {
      expect(screen.getByTestId('transaction-form')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Close Form'));
    await waitFor(() => {
      expect(screen.queryByTestId('transaction-form')).not.toBeInTheDocument();
    });
  });

  it('deve lidar com o botão de importar csv e modal', async () => {
    const fetchMock = vi.fn();
    (useTransactions as any).mockReturnValue({
      transactions: [],
      summary: {},
      history: [],
      isLoading: false,
      fetchTransactions: fetchMock,
      deleteTransactionsByMonth: vi.fn(),
    });

    render(<Dashboard />);
    fireEvent.click(screen.getByText('Importar CSV'));
    await waitFor(() => {
      expect(screen.getByTestId('import-wizard')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Success Import'));
    expect(fetchMock).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Close Import'));
    await waitFor(() => {
      expect(screen.queryByTestId('import-wizard')).not.toBeInTheDocument();
    });
  });
});
