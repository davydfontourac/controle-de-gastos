import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PasswordInput } from './PasswordInput';
import React from 'react';

describe('PasswordInput', () => {
  it('deve renderizar o input como password por padrão', () => {
    render(<PasswordInput id="password" label="Senha" />);
    const input = screen.getByLabelText('Senha');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('deve alternar a visibilidade da senha ao clicar no botão', () => {
    render(<PasswordInput id="password" label="Senha" />);
    const input = screen.getByLabelText('Senha');
    const button = screen.getByRole('button', { name: /mostrar senha/i });

    // Show
    fireEvent.click(button);
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /esconder senha/i })).toBeInTheDocument();

    // Hide
    fireEvent.click(screen.getByRole('button', { name: /esconder senha/i }));
    expect(input).toHaveAttribute('type', 'password');
    expect(screen.getByRole('button', { name: /mostrar senha/i })).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro se fornecida', () => {
    render(<PasswordInput id="password" label="Senha" error="Senha inválida" />);
    expect(screen.getByText('Senha inválida')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toHaveClass('border-red-500');
  });

  it('deve exibir helperText se fornecido e não houver erro', () => {
    render(<PasswordInput id="password" label="Senha" helperText="Dica de senha" />);
    expect(screen.getByText('Dica de senha')).toBeInTheDocument();
  });

  it('não deve exibir helperText se houver erro', () => {
    render(<PasswordInput id="password" label="Senha" helperText="Dica de senha" error="Erro" />);
    expect(screen.queryByText('Dica de senha')).not.toBeInTheDocument();
    expect(screen.getByText('Erro')).toBeInTheDocument();
  });

  it('deve passar a ref corretamente', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<PasswordInput id="password" label="Senha" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('deve aceitar props adicionais de input', () => {
    render(<PasswordInput id="password" label="Senha" placeholder="Digite sua senha" data-testid="custom-input" />);
    const input = screen.getByTestId('custom-input');
    expect(input).toHaveAttribute('placeholder', 'Digite sua senha');
  });
});
