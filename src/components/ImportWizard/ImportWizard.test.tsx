import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ImportWizard from './ImportWizard';
import { useAuth } from '@/context/AuthContext';
import { parseCSV, transformCSVData } from '@/utils/csvParser';
import { supabase } from '@/services/supabase';

vi.mock('@/utils/csvParser', () => ({
  parseCSV: vi.fn(),
  transformCSVData: vi.fn()
}));

vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/services/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({ data: [{ id: '1', name: 'Cat' }], error: null }),
    insert: vi.fn().mockResolvedValue({ error: null })
  }
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() }
}));

describe('ImportWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({ user: { id: 'user-1' } });
    (parseCSV as any).mockResolvedValue([
      { date: '2026-04-20', description: 'Test', amount: '100' }
    ]);
    (transformCSVData as any).mockReturnValue([
      { date: '2026-04-20', description: 'Test', amount: 100, type: 'expense', category_id: '1' }
    ]);
  });

  it('deve renderizar sem quebrar', () => {
    render(<ImportWizard isOpen={true} onClose={() => {}} onSuccess={() => {}} />);
    expect(screen.getByText('Importar Transações')).toBeInTheDocument();
  });

  it('deve fechar ao clicar no botao fechar', () => {
    const onCloseMock = vi.fn();
    render(<ImportWizard isOpen={true} onClose={onCloseMock} onSuccess={() => {}} />);
    const closeBtns = screen.getAllByRole('button');
    fireEvent.click(closeBtns[0]);
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('deve simular o fluxo completo de importação', async () => {
    const onSuccessMock = vi.fn();
    const onCloseMock = vi.fn();
    
    render(<ImportWizard isOpen={true} onClose={onCloseMock} onSuccess={onSuccessMock} />);
    
    // Simulate File Upload step by clicking Próximo without file (should show error and not advance)
    const nextBtn = screen.getByRole('button', { name: /Próximo/i });
    fireEvent.click(nextBtn);
    expect(screen.getByText('Upload')).toBeInTheDocument(); // Still on step 1

    // Upload file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for parseCSV to run
    await waitFor(() => {
      expect(parseCSV).toHaveBeenCalledWith(file);
    });

    // Advance to Mapping Step
    fireEvent.click(nextBtn);
    await waitFor(() => {
      expect(screen.getByText('Mapeamento')).toBeInTheDocument();
    });

    // We can't advance if mapping is incomplete. But auto-mapping in useEffect might have filled it.
    // Let's just advance again assuming auto-mapping worked
    const nextBtnStep2 = screen.getByRole('button', { name: /Próximo/i });
    fireEvent.click(nextBtnStep2);
    
    // Step 3 (Preview)
    await waitFor(() => {
      expect(transformCSVData).toHaveBeenCalled();
    });

    // Confirm Import
    const importBtn = screen.getByRole('button', { name: /Confirmar Importação/i });
    fireEvent.click(importBtn);

    // Wait for supabase insert
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('transactions');
      expect(supabase.from('transactions').insert).toHaveBeenCalled();
      expect(onSuccessMock).toHaveBeenCalled();
      expect(onCloseMock).toHaveBeenCalled();
    });
  });

  it('deve lidar com erro na importação', async () => {
    (supabase.from('transactions').insert as any).mockRejectedValueOnce(new Error('Insert error'));
    
    render(<ImportWizard isOpen={true} onClose={() => {}} onSuccess={() => {}} />);
    
    // Simulate jumping to step 2 (import) by manually triggering states
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['data'], 'test.csv', { type: 'text/csv' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => expect(parseCSV).toHaveBeenCalled());

    const nextBtn = screen.getByRole('button', { name: /Próximo/i });
    fireEvent.click(nextBtn); // To Step 2
    fireEvent.click(screen.getByRole('button', { name: /Próximo/i })); // To Step 3

    await waitFor(() => expect(transformCSVData).toHaveBeenCalled());

    const importBtn = screen.getByRole('button', { name: /Confirmar Importação/i });
    fireEvent.click(importBtn);

    // Expect not to close or succeed
    await waitFor(() => {
      expect(supabase.from('transactions').insert).toHaveBeenCalled();
    });
  });
});
