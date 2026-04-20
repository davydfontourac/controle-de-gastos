import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CategoryForm from './CategoryForm';
import { supabase } from '@/services/supabase';

const mockQuery = {
  update: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  then: vi.fn(),
};

vi.mock('@/services/supabase', () => ({
  supabase: {
    from: vi.fn(() => mockQuery),
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: 'u-123' } }, error: null }),
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('CategoryForm', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    category: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockQuery.then.mockImplementation((cb) => cb({ error: null }));
  });

  it('não deve renderizar quando isOpen é false', () => {
    const { container } = render(<CategoryForm {...defaultProps} isOpen={false} />);
    expect(container.firstChild).toBeNull();
  });

  it('deve renderizar "Nova Categoria" quando não há categoria para editar', () => {
    render(<CategoryForm {...defaultProps} />);
    expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
  });

  it('deve renderizar "Editar Categoria" quando uma categoria é passada', () => {
    const category = { id: 'c-1', name: 'Alimentação', icon: 'utensils', color: '#EF4444' };
    render(<CategoryForm {...defaultProps} category={category} />);
    expect(screen.getByText('Editar Categoria')).toBeInTheDocument();
  });

  it('deve preencher campos ao editar uma categoria existente', () => {
    const category = { id: 'c-1', name: 'Alimentação', icon: 'utensils', color: '#EF4444' };
    render(<CategoryForm {...defaultProps} category={category} />);

    expect(screen.getByPlaceholderText(/Ex: Alimentação/)).toHaveValue('Alimentação');
  });

  it('deve chamar onClose ao clicar em Cancelar', () => {
    const onClose = vi.fn();
    render(<CategoryForm {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Cancelar'));
    expect(onClose).toHaveBeenCalled();
  });

  it('deve criar uma nova categoria com supabase', async () => {
    const toast = await import('sonner');
    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(<CategoryForm {...defaultProps} onSuccess={onSuccess} onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText(/Ex: Alimentação/), {
      target: { value: 'Educação' },
    });

    fireEvent.click(screen.getByText('Salvar Categoria'));

    await waitFor(() => {
      expect(supabase.auth.getUser).toHaveBeenCalled();
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(mockQuery.insert).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'Educação',
          user_id: 'u-123',
        }),
      ]);
      expect(toast.toast.success).toHaveBeenCalledWith('Categoria criada!');
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('deve atualizar uma categoria existente com supabase', async () => {
    const toast = await import('sonner');
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    const category = { id: 'c-1', name: 'Alimentação', icon: 'utensils', color: '#EF4444' };

    render(
      <CategoryForm {...defaultProps} category={category} onSuccess={onSuccess} onClose={onClose} />,
    );

    fireEvent.change(screen.getByPlaceholderText(/Ex: Alimentação/), {
      target: { value: 'Alimentação Atualizada' },
    });

    fireEvent.click(screen.getByText('Salvar Categoria'));

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('categories');
      expect(mockQuery.update).toHaveBeenCalled();
      expect(mockQuery.eq).toHaveBeenCalledWith('id', 'c-1');
      expect(toast.toast.success).toHaveBeenCalledWith('Categoria atualizada!');
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('deve exibir erro ao falhar na criação', async () => {
    const toast = await import('sonner');
    mockQuery.then.mockImplementationOnce((cb) =>
      cb({ error: { message: 'Insert failed' } }),
    );

    render(<CategoryForm {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText(/Ex: Alimentação/), {
      target: { value: 'Erro' },
    });

    fireEvent.click(screen.getByText('Salvar Categoria'));

    await waitFor(() => {
      expect(toast.toast.error).toHaveBeenCalledWith('Erro ao salvar categoria');
    });
  });

  it('deve selecionar cor preset ao clicar', () => {
    render(<CategoryForm {...defaultProps} />);

    const colorButtons = screen.getAllByRole('button').filter((btn) => {
      const style = btn.getAttribute('style');
      return style && style.includes('background-color');
    });

    expect(colorButtons.length).toBe(8);

    // Click second color
    fireEvent.click(colorButtons[1]);
    // The selected color button should have ring class
    expect(colorButtons[1]).toHaveClass('ring-2');
  });

  it('deve validar nome obrigatório ao submeter vazio', async () => {
    render(<CategoryForm {...defaultProps} />);

    // Clear the name field
    fireEvent.change(screen.getByPlaceholderText(/Ex: Alimentação/), {
      target: { value: '' },
    });

    fireEvent.click(screen.getByText('Salvar Categoria'));

    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument();
  });
});
