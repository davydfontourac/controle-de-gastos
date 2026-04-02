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
    
    // Recurrence checkbox
    const checkbox = screen.getByLabelText(/Repetir transação/);
    expect(checkbox).not.toBeChecked();
    
    // Frequency and installments fields should not be visible
    expect(screen.queryByText('Frequência')).not.toBeInTheDocument();
    expect(screen.queryByText('Ocorrências')).not.toBeInTheDocument();

    // Check it
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Now fields should be visible
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
    
    // Frequency must be set as weekly
    const freqSelect = screen.getByRole('combobox', { name: /Frequência/i }) as HTMLSelectElement;
    expect(freqSelect.value).toBe('weekly');
  });

  it('deve enviar o formulário com dados de recorrência corretamente', async () => {
    (api.post as any).mockResolvedValue({ data: { id: 'new-1' } });
    
    render(<TransactionForm isOpen={true} onClose={() => {}} onSuccess={() => {}} />);
    
    fireEvent.change(screen.getByPlaceholderText(/Ex: Freela/), { target: { value: 'Compra Recorrente' } });
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '150' } });
    
    // Open recurrence
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

  it('não deve renderizar nada quando isOpen for false', () => {
    const { container } = render(<TransactionForm isOpen={false} onClose={() => {}} onSuccess={() => {}} />);
    expect(container.firstChild).toBeNull();
    expect(api.get).not.toHaveBeenCalled();
  });

  it('deve chamar onClose ao clicar no botão de fechar', () => {
    const onClose = vi.fn();
    render(<TransactionForm isOpen={true} onClose={onClose} onSuccess={() => {}} />);
    
    fireEvent.click(screen.getByRole('button', { name: '' })); // O botão X tem a classe p-2 e ícone X. No Lucide, geralmente não tem label.
    // Olhando o código: <button onClick={onClose} ...><X className="w-5 h-5" /></button>
    // Vou tentar buscar pelo contêiner ou pelo ícone se possível, ou apenas clicar no botão que tem o X.
    // Lucide X component usually renders an svg with data-testid="x" or similar if configured, but here it's just a class.
    // Let's use the first button in the header or find by selector.
    const closeButtons = screen.getAllByRole('button');
    fireEvent.click(closeButtons[0]); // O primeiro botão é o de fechar
    expect(onClose).toHaveBeenCalled();
  });

  it('deve enviar o formulário de edição corretamente', async () => {
    const mockTransaction = {
      id: '1',
      description: 'Teste Edição',
      amount: 100,
      date: '2026-03-10',
      type: 'expense'
    };
    const onSuccess = vi.fn();
    const onClose = vi.fn();
    
    (api.put as any).mockResolvedValue({ data: { id: '1' } });

    render(
      <TransactionForm 
        isOpen={true} 
        onClose={onClose} 
        onSuccess={onSuccess} 
        transaction={mockTransaction} 
      />
    );

    fireEvent.click(screen.getByText('Salvar Transação'));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/transactions/1', expect.objectContaining({
        description: 'Teste Edição',
        amount: 100
      }));
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('deve alternar entre despesa e receita ao clicar nos botões', () => {
    render(<TransactionForm isOpen={true} onClose={() => {}} onSuccess={() => {}} />);
    
    const expenseBtn = screen.getByText('Despesa').closest('button')!;
    const incomeBtn = screen.getByText('Receita').closest('button')!;

    // Inicialmente é despesa (default)
    expect(expenseBtn).toHaveClass('text-red-600');
    
    // Clica em Receita
    fireEvent.click(incomeBtn);
    expect(incomeBtn).toHaveClass('text-emerald-600');
    expect(expenseBtn).not.toHaveClass('text-red-600');

    // Clica em Despesa de volta
    fireEvent.click(expenseBtn);
    expect(expenseBtn).toHaveClass('text-red-600');
    expect(incomeBtn).not.toHaveClass('text-emerald-600');
  });

  it('deve carregar e renderizar categorias', async () => {
    const mockCategories = [
      { id: 'cat-1', name: 'Alimentação' },
      { id: 'cat-2', name: 'Transporte' }
    ];
    (api.get as any).mockResolvedValue({ data: mockCategories });

    render(<TransactionForm isOpen={true} onClose={() => {}} onSuccess={() => {}} />);

    // Wait for the categories to actually appear in the DOM (not just the API call)
    const alimentacaoOption = await screen.findByText('Alimentação');
    expect(alimentacaoOption).toBeInTheDocument();
    expect(screen.getByText('Transporte')).toBeInTheDocument();

    const select = screen.getByLabelText(/Categoria/i);
    fireEvent.change(select, { target: { value: 'cat-1' } });
    expect((select as HTMLSelectElement).value).toBe('cat-1');
  });

  it('deve validar campos obrigatórios ao submeter vazio', async () => {
    render(<TransactionForm isOpen={true} onClose={() => {}} onSuccess={() => {}} />);
    
    // Limpar campos que podem vir com default (como data)
    // Mas a descrição vem vazia. O valor vem vazio.
    
    fireEvent.click(screen.getByText('Salvar Transação'));

    expect(await screen.findByText('A descrição é obrigatória.')).toBeInTheDocument();
    expect(await screen.findByText('O valor é obrigatório.')).toBeInTheDocument();
  });

  it('deve enviar o formulário com categoria null se nenhuma for selecionada', async () => {
    (api.post as any).mockResolvedValue({ data: { id: 'new-1' } });
    
    render(<TransactionForm isOpen={true} onClose={() => {}} onSuccess={() => {}} />);
    
    fireEvent.change(screen.getByPlaceholderText(/Ex: Freela/), { target: { value: 'Sem Categoria' } });
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '100' } });
    
    // category_id por padrão é null no formState, e o select inicia em "" (Sem categoria)
    
    fireEvent.click(screen.getByText('Salvar Transação'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/transactions', expect.objectContaining({
        description: 'Sem Categoria',
        amount: 100,
        category_id: null
      }));
    });
  });

  it('deve lidar com erro específico retornado pelo servidor', async () => {
    const toast = await import('sonner');
    (api.post as any).mockRejectedValue({ 
      response: { data: { error: 'Mensagem de Erro do Servidor' } } 
    });
    
    render(<TransactionForm isOpen={true} onClose={() => {}} onSuccess={() => {}} />);
    
    fireEvent.change(screen.getByPlaceholderText(/Ex: Freela/), { target: { value: 'Erro' } });
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '10' } });
    
    fireEvent.click(screen.getByText('Salvar Transação'));

    await waitFor(() => {
      expect(toast.toast.error).toHaveBeenCalledWith('Mensagem de Erro do Servidor');
    });
  });

  it('deve lidar com erro na submissão sem mensagem do servidor', async () => {
    const toast = await import('sonner');
    (api.post as any).mockRejectedValue(new Error('Generic Error'));
    
    render(<TransactionForm isOpen={true} onClose={() => {}} onSuccess={() => {}} />);
    
    fireEvent.change(screen.getByPlaceholderText(/Ex: Freela/), { target: { value: 'Erro' } });
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '10' } });
    
    fireEvent.click(screen.getByText('Salvar Transação'));

    await waitFor(() => {
      expect(toast.toast.error).toHaveBeenCalledWith('Erro ao salvar transação.');
    });
  });

  it('deve validar data obrigatória', async () => {
    render(<TransactionForm isOpen={true} onClose={() => {}} onSuccess={() => {}} />);
    
    // O valor default é o dia de hoje. Vamos limpar.
    const dateInput = screen.getByLabelText(/Data da primeira/);
    fireEvent.change(dateInput, { target: { value: '' } });

    fireEvent.click(screen.getByText('Salvar Transação'));

    expect(await screen.findByText('A data é obrigatória.')).toBeInTheDocument();
  });

  it('deve carregar categoria na edição se presente', async () => {
    const mockCategories = [{ id: 'cat-123', name: 'Lazer' }];
    (api.get as any).mockResolvedValue({ data: mockCategories });

    const mockTransaction = {
      id: '1',
      description: 'Teste Categoria',
      amount: 100,
      date: '2026-03-10',
      type: 'expense',
      category_id: 'cat-123'
    };

    render(
      <TransactionForm 
        isOpen={true} 
        onClose={() => {}} 
        onSuccess={() => {}} 
        transaction={mockTransaction} 
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Lazer')).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/Categoria/i) as HTMLSelectElement;
    expect(select.value).toBe('cat-123');
  });

  it('deve enviar o formulário com uma categoria selecionada', async () => {
    const mockCategories = [{ id: 'cat-789', name: 'Saúde' }];
    (api.get as any).mockResolvedValue({ data: mockCategories });
    (api.post as any).mockResolvedValue({ data: { id: 'new-2' } });

    render(<TransactionForm isOpen={true} onClose={() => {}} onSuccess={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Saúde')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText(/Ex: Freela/), { target: { value: 'Consulta' } });
    fireEvent.change(screen.getByPlaceholderText('0,00'), { target: { value: '250' } });
    fireEvent.change(screen.getByLabelText(/Categoria/i), { target: { value: 'cat-789' } });

    fireEvent.click(screen.getByText('Salvar Transação'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/transactions', expect.objectContaining({
        description: 'Consulta',
        amount: 250,
        category_id: 'cat-789'
      }));
    });
  });

  it('deve lidar com edição de transação sem categoria', async () => {
    const mockCategories = [{ id: 'cat-1', name: 'Alimentação' }];
    (api.get as any).mockResolvedValue({ data: mockCategories });

    const mockTransaction = {
      id: '1',
      description: 'Sem Categoria',
      amount: 50,
      date: '2026-03-10',
      type: 'expense',
      category_id: null
    };

    render(<TransactionForm isOpen={true} onClose={() => {}} onSuccess={() => {}} transaction={mockTransaction} />);

    await waitFor(() => {
      expect(screen.getByText('Alimentação')).toBeInTheDocument();
    });

    const select = screen.getByLabelText(/Categoria/i) as HTMLSelectElement;
    expect(select.value).toBe('');
  });
});
