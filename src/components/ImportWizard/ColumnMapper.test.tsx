import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ColumnMapper from './ColumnMapper';
import type { CSVMapping } from '@/utils/csvParser';

const mockHeaders = ['Data', 'Descricao', 'Valor', 'Categoria'];
const mockSampleData = [{ Data: '01/01/2026', Descricao: 'Teste', Valor: '100' }];
const mockMapping: CSVMapping = {
  date: 'Data',
  description: '',
  amount: 'Valor',
  dateFormat: 'dd/MM/yyyy',
  decimalSeparator: ','
};

describe('ColumnMapper', () => {
  it('deve renderizar os controles de mapeamento corretamente', () => {
    const onChangeMock = vi.fn();
    const { container } = render(
      <ColumnMapper 
        headers={mockHeaders} 
        sampleData={mockSampleData} 
        mapping={mockMapping} 
        onMappingChange={onChangeMock} 
      />
    );

    const selects = container.querySelectorAll('select');
    expect(selects[0].value).toBe('Data'); // Date
    expect(selects[2].value).toBe('Valor'); // Amount
  });

  it('deve chamar onMappingChange ao alterar um select', () => {
    const onChangeMock = vi.fn();
    const { container } = render(
      <ColumnMapper 
        headers={mockHeaders} 
        sampleData={mockSampleData} 
        mapping={mockMapping} 
        onMappingChange={onChangeMock} 
      />
    );

    const selects = container.querySelectorAll('select');
    fireEvent.change(selects[1], { target: { value: 'Descricao' } }); // Description

    expect(onChangeMock).toHaveBeenCalledWith({
      ...mockMapping,
      description: 'Descricao'
    });
  });
});

