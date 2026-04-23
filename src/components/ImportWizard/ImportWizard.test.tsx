import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ImportWizard from './ImportWizard';
import { parseCSV, transformCSVData } from '@/utils/csvParser';
import { useAuth } from '@/context/AuthContext';
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

describe('ImportWizard', () => {
  beforeEach(() => {
    (useAuth as any).mockReturnValue({ user: { id: 'user-1' } });
  });

  it('deve renderizar sem quebrar', () => {
    render(<ImportWizard isOpen={true} onClose={() => {}} onSuccess={() => {}} />);
    expect(screen.getByText('Importar Transações')).toBeInTheDocument();
  });

  it('deve fechar ao clicar no botao fechar', () => {
    const onCloseMock = vi.fn();
    render(<ImportWizard isOpen={true} onClose={onCloseMock} onSuccess={() => {}} />);
    
    // Botão de fechar modal (X)
    const closeBtns = screen.getAllByRole('button');
    // Clica no primeiro botao que geralmente é o X
    fireEvent.click(closeBtns[0]);
    expect(onCloseMock).toHaveBeenCalled();
  });
});
