import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

// Mocks Supabase before any App import to avoid
// the "Supabase URL or Anon Key is missing" error in the CI environment
vi.mock('@/services/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));

import App from './App';
import { AuthProvider } from './context/AuthContext';


// Mocks the matchMedia API that framer-motion might use or other UI tools
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('App', () => {
  it('renders without crashing (Smoke Test)', () => {
    // Renders the app inside a MemoryRouter for AuthRoutes and AppRoutes to work
    render(
      <MemoryRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MemoryRouter>
    );

    // In our unlogged main structure, <App> will take us to either Login or Loading Splash routes
    // Only check if the main elements of div or root existed without crashing.
    const mainElement = document.querySelector('div');
    expect(mainElement).toBeInTheDocument();
  });
});
