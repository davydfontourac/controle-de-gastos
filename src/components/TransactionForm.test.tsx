import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TransactionForm from './TransactionForm';
import { api } from '@/services/api';

// Mock API and external libraries
vi.mock('@/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  }
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('TransactionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockResolvedValue({ data: [] });
  });

  it('deve renderizar o formulário quando estiver aberto', () => {
    render(<TransactionForm isOpen={true} onClose={() => {}} onSuccess={() => {}} />);
    expect(screen.getByText('Nova Transação')).toBeInTheDocument();
  });

  it('deve mostrar campos de recorrência apenas quando o checkbox está marcado', () => {
    render(<TransactionForm isOpen={true} onClose={() => {}} onSuccess={() => {}} />);
    
    // Checkbox de recorrência
    const checkbox = screen.getByLabelText(/Repetir transação/);
    expect(checkbox).not.toBeChecked();
    
    // Campos de frequência e parcelas não devem estar visíveis
    expect(screen.queryByText('Frequência')).not.toBeInTheDocument();
    expect(screen.queryByText('Ocorrências')).not.toBeInTheDocument();

    // Marcar checkbox
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Agora campos devem estar visíveis
    expect(screen.getByText('Frequência')).toBeInTheDocument();
    expect(screen.getByText('Ocorrências')).toBeInTheDocument();
  });

  it('deve permitir selecionar as frequências disponíveis', async () => {
    render(<TransactionForm isOpen={true} onClose={() => {}} onSuccess={() => {}} />);
    
    const checkbox = screen.getByLabelText(/Repetir transação/);
    fireEvent.click(checkbox);

    const freqSelect = screen.getByRole('combobox', { name: /Frequência/i }) as HTMLSelectElement;
    
    fireEvent.change(freqSelect, { target: { value: 'weekly' } });
    expect(freqSelect.value).toBe('weekly');

    fireEvent.change(freqSelect, { target: { value: 'yearly' } });
    expect(freqSelect.value).toBe('yearly');

    fireEvent.change(freqSelect, { target: { value: 'monthly' } });
    expect(freqSelect.value).toBe('monthly');
  });

  it('deve inicializar com valores de edição se uma transação for passada', async () => {
    const mockTransaction = {
      id: '1',
      description: 'Teste Edição',
      amount: 100,
      date: '2026-03-10',
      type: 'expense',
      is_recurrent: true,
      frequency: 'weekly'
    };

    render(
      <TransactionForm 
        isOpen={true} 
        onClose={() => {}} 
        onSuccess={() => {}} 
        transaction={mockTransaction} 
      />
    );

    expect(screen.getByPlaceholderText(/Ex: Freela/)).toHaveValue('Teste Edição');
    expect(screen.getByLabelText(/Repetir transação/)).toBeChecked();
    
    // Frequência deve estar setada como weekly
    const freqSelect = screen.getByRole('combobox', { name: /Frequência/i }) as HTMLSelectElement;
    expect(freqSelect.value).toBe('weekly');
  });

  it('deve enviar o formulário com dados de recorrência corretamente', async () => {
    (api.post as any).mockResolvedValue({ data: { id: 'new-1' } });
    
    render(<TransactionForm isOpen={true} onClose={() => {}} onSuccess={() => {}} />);
    
    fireEvent.change(screen.getByPlaceholderText(/Ex: Freela/), { target: { value: 'Compra Recorrente' } });
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '150' } });
    
    // Abrir recorrência
    fireEvent.click(screen.getByLabelText(/Repetir transação/));
    
    // Selecionar frequência e parcelas
    fireEvent.change(screen.getByRole('combobox', { name: /Frequência/i }), { target: { value: 'monthly' } });
    fireEvent.change(screen.getByRole('spinbutton', { name: /Ocorrências/i }), { target: { value: '10' } });

    fireEvent.click(screen.getByText('Salvar Transação'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/transactions', expect.objectContaining({
        description: 'Compra Recorrente',
        amount: 150,
        is_recurrent: true,
        frequency: 'monthly',
        installments: 10
      }));
    });
  });

  it('deve lidar com erro na submissão', async () => {
    const toast = await import('sonner');
    (api.post as any).mockRejectedValue({ 
      response: { data: { error: 'Falha no Servidor' } } 
    });
    
    render(<TransactionForm isOpen={true} onClose={() => {}} onSuccess={() => {}} />);
    
    fireEvent.change(screen.getByPlaceholderText(/Ex: Freela/), { target: { value: 'Erro' } });
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '10' } });
    
    fireEvent.click(screen.getByText('Salvar Transação'));

    await waitFor(() => {
      expect(toast.toast.error).toHaveBeenCalledWith('Falha no Servidor');
    });
  });
});
