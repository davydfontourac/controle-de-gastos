import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Categories from './Categories';

const mockFetchCategories = vi.fn();
const mockCategories: any[] = [];
let mockIsLoading = false;

vi.mock('@/hooks/useCategories', () => ({
  useCategories: () => ({
    categories: mockCategories,
    isLoading: mockIsLoading,
    fetchCategories: mockFetchCategories,
  }),
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ profile: null }),
}));

vi.mock('@/services/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation((cb) => cb({ error: null })),
    })),
  },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => <button>Theme</button>,
}));

vi.mock('@/components/BottomNavigation', () => ({
  default: () => <nav data-testid="bottom-nav" />,
}));

vi.mock('@/components/PageTransition', () => ({
  default: ({ children, className }: any) => <div className={className}>{children}</div>,
}));

vi.mock('@/components/ConfirmModal', () => ({
  default: ({ isOpen, onConfirm, onClose }: any) =>
    isOpen ? (
      <div data-testid="confirm-modal">
        <button onClick={onConfirm}>Confirmar</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    ) : null,
}));

vi.mock('@/components/CategoryForm', () => ({
  default: ({ isOpen }: any) => (isOpen ? <div data-testid="category-form" /> : null),
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('Categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCategories.length = 0;
    mockIsLoading = false;
  });

  it('deve renderizar o título "Minhas Categorias"', () => {
    render(<Categories />);
    expect(screen.getByText('Minhas Categorias')).toBeInTheDocument();
  });

  it('deve exibir a tela de vazio quando não há categorias', () => {
    render(<Categories />);
    expect(screen.getByText('Nenhuma categoria')).toBeInTheDocument();
  });

  it('deve abrir o formulário ao clicar em "Criar Primeira Categoria"', () => {
    render(<Categories />);
    fireEvent.click(screen.getByText('Criar Primeira Categoria'));
    expect(screen.getByTestId('category-form')).toBeInTheDocument();
  });

  it('deve abrir o formulário ao clicar em "Nova Categoria"', () => {
    render(<Categories />);
    fireEvent.click(screen.getByText('Nova Categoria'));
    expect(screen.getByTestId('category-form')).toBeInTheDocument();
  });

  it('deve chamar fetchCategories ao montar', async () => {
    render(<Categories />);
    await waitFor(() => {
      expect(mockFetchCategories).toHaveBeenCalled();
    });
  });

  it('deve exibir skeletons durante o carregamento', () => {
    mockIsLoading = true;
    const { container } = render(<Categories />);
    expect(container.querySelector('.animate-pulse')).not.toBeNull();
  });

  it('deve exibir a lista de categorias quando há dados', () => {
    mockCategories.push(
      { id: 'c-1', name: 'Alimentação', color: '#EF4444', icon: 'tag' },
      { id: 'c-2', name: 'Transporte', color: '#6B7280', icon: 'tag' },
    );
    render(<Categories />);
    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('Transporte')).toBeInTheDocument();
  });
});
