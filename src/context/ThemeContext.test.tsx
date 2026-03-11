import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import userEvent from '@testing-library/user-event';

// Mock window.matchMedia required by ThemeContext system mode detection
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

function ThemeConsumer() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme('dark')}>dark</button>
      <button onClick={() => setTheme('light')}>light</button>
      <button onClick={() => setTheme('system')}>system</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark', 'light', 'system');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('deve fornecer o tema padrão "system"', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('system');
  });

  it('deve usar defaultTheme passado como prop', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });

  it('deve carregar tema salvo no localStorage', () => {
    localStorage.setItem('vite-ui-theme', 'light');
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    expect(screen.getByTestId('theme').textContent).toBe('light');
  });

  it('deve atualizar o tema e salvar no localStorage ao chamar setTheme', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    await act(async () => {
      await user.click(screen.getByText('dark'));
    });
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(localStorage.getItem('vite-ui-theme')).toBe('dark');
  });

  it('deve adicionar classe "dark" ao documentElement quando tema é dark', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    await act(async () => {
      await user.click(screen.getByText('dark'));
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('deve adicionar classe "light" ao documentElement quando tema é light', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    await act(async () => {
      await user.click(screen.getByText('light'));
    });
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('deve usar storageKey personalizado', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider storageKey="my-theme-key">
        <ThemeConsumer />
      </ThemeProvider>
    );
    await act(async () => {
      await user.click(screen.getByText('light'));
    });
    expect(localStorage.getItem('my-theme-key')).toBe('light');
  });

});
