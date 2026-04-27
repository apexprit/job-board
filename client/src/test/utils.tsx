import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, AuthContextType } from '../context/AuthContext';

// Mock user data for tests
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  firstName: 'Test',
  lastName: 'User',
  role: 'candidate' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockEmployer = {
  id: 'employer-1',
  email: 'employer@example.com',
  name: 'Test Employer',
  firstName: 'Test',
  lastName: 'Employer',
  role: 'employer' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockAdmin = {
  id: 'admin-1',
  email: 'admin@example.com',
  name: 'Test Admin',
  firstName: 'Test',
  lastName: 'Admin',
  role: 'admin' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Default unauthenticated context
const defaultAuthContext: AuthContextType = {
  user: null,
  accessToken: null,
  isLoading: false,
  isAuthenticated: false,
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn(),
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authContext?: Partial<AuthContextType>;
  route?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  { authContext, route = '/', ...options }: CustomRenderOptions = {}
) {
  const authValue = { ...defaultAuthContext, ...authContext };

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={[route]}>
        <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>
      </MemoryRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
