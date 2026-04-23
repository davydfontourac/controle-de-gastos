import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FileUpload from './FileUpload';

describe('FileUpload', () => {
  it('deve renderizar o componente de upload corretamente', () => {
    render(<FileUpload file={null} onFileSelect={() => {}} />);
    expect(screen.getByText(/Arraste seu arquivo CSV aqui/i)).toBeInTheDocument();
  });

  it('deve chamar onFileSelect quando um arquivo é selecionado via input', () => {
    const onFileSelectMock = vi.fn();
    const { container } = render(<FileUpload file={null} onFileSelect={onFileSelectMock} />);

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test'], 'test.csv', { type: 'text/csv' });
    
    fireEvent.change(input, { target: { files: [file] } });

    expect(onFileSelectMock).toHaveBeenCalledWith(file);
  });

  it('deve ignorar se o arquivo arrastado não for CSV', () => {
    const onFileSelectMock = vi.fn();
    const { container } = render(<FileUpload file={null} onFileSelect={onFileSelectMock} />);

    const dropZone = container.querySelector('.border-dashed');
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.drop(dropZone!, { dataTransfer: { files: [file] } });

    expect(onFileSelectMock).not.toHaveBeenCalled();
  });
});
