import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Profile from './Profile';
import { supabase } from '@/services/supabase';

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u-123' },
    profile: { full_name: 'John Doe', avatar_url: '' },
    isLoading: false,
    refreshProfile: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock('@/services/supabase', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://img.com/a.jpg' } }),
      })),
    },
  },
}));

vi.mock('react-router-dom', () => ({
  Link: ({ children, to, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useNavigate: () => vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/components/ThemeToggle', () => ({
  ThemeToggle: () => <button>ThemeToggle</button>,
}));

vi.mock('@/components/BottomNavigation', () => ({
  default: () => <nav>BottomNav</nav>,
}));

vi.mock('@/components/PageTransition', () => ({
  default: ({ children }: any) => <div>{children}</div>,
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

describe('Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o perfil corretamente', () => {
    render(<Profile />);
    expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
  });

  it('deve chamar rpc de delete_user ao confirmar exclusão da conta', async () => {
    const toast = await import('sonner');
    (supabase.rpc as any).mockResolvedValueOnce({ error: null });

    render(<Profile />);

    // Clica no botão de excluir conta
    fireEvent.click(screen.getByText('Excluir Minha Conta'));

    // Modal deve abrir
    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();

    // Confirma exclusão
    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => {
      expect(supabase.rpc).toHaveBeenCalledWith('delete_user');
      expect(toast.toast.success).toHaveBeenCalledWith('Sua conta foi excluída permanentemente.');
    });
  });

  it('deve lidar com erro ao excluir conta', async () => {
    const toast = await import('sonner');
    (supabase.rpc as any).mockRejectedValueOnce(new Error('RPC failed'));

    render(<Profile />);

    fireEvent.click(screen.getByText('Excluir Minha Conta'));
    fireEvent.click(screen.getByText('Confirmar'));

    await waitFor(() => {
      expect(toast.toast.error).toHaveBeenCalledWith('Erro ao excluir conta. Tente novamente mais tarde.');
    });
  });
});
