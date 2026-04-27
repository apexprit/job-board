import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, renderHook } from '@testing-library/react';
import { renderWithProviders as render, mockUser } from '../test/utils';
import { AuthProvider } from './AuthContext';
import { useAuth } from '../hooks/useAuth';

// Test component that uses the auth context
const AuthConsumer = () => {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user-name">{user?.name || 'No user'}</span>
      <button onClick={() => login({ email: 'test@example.com', password: 'Password1!' })}>
        Login
      </button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with loading true then becomes false', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    // After initialization, loading should become false
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });

  it('is not authenticated by default', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
  });

  it('shows no user by default', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('No user');
    });
  });

  it('restores user from localStorage', async () => {
    localStorage.setItem('jobboard_access_token', 'stored-token');
    localStorage.setItem('jobboard_user', JSON.stringify(mockUser));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    });
  });

  it('clears invalid localStorage data', async () => {
    localStorage.setItem('jobboard_access_token', 'token');
    localStorage.setItem('jobboard_user', 'invalid-json');

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    expect(localStorage.getItem('jobboard_access_token')).toBeNull();
    expect(localStorage.getItem('jobboard_user')).toBeNull();
  });
});

describe('useAuth hook', () => {
  it('throws error when used outside AuthProvider', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    spy.mockRestore();
  });
});
