import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { renderWithProviders as render, mockUser, mockEmployer } from '../../test/utils';
import ProtectedRoute from './ProtectedRoute';

// Helper to wrap component with routes for proper navigation handling
const renderWithRoutes = (
  ui: React.ReactElement,
  options?: Parameters<typeof render>[1]
) => {
  return render(
    <Routes>
      <Route path="/protected" element={ui} />
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/dashboard" element={<div>Dashboard Page</div>} />
      <Route path="/custom-login" element={<div>Custom Login Page</div>} />
    </Routes>,
    { ...options, route: '/protected' }
  );
};

describe('ProtectedRoute Component', () => {
  it('redirects to login when not authenticated', () => {
    renderWithRoutes(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    // Should redirect to login page
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    renderWithRoutes(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      {
        authContext: {
          user: mockUser,
          accessToken: 'test-token',
          isAuthenticated: true,
          isLoading: false,
        },
      }
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    const { container } = renderWithRoutes(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      {
        authContext: {
          isLoading: true,
        },
      }
    );
    // Should show spinner (animate-spin class)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('does not show spinner when showLoading is false', () => {
    const { container } = renderWithRoutes(
      <ProtectedRoute showLoading={false}>
        <div>Protected Content</div>
      </ProtectedRoute>,
      {
        authContext: {
          isLoading: true,
        },
      }
    );
    // No spinner, but also no content (redirects)
    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
  });

  it('redirects to dashboard when user does not have required role', () => {
    renderWithRoutes(
      <ProtectedRoute allowedRoles={['employer']}>
        <div>Employer Only Content</div>
      </ProtectedRoute>,
      {
        authContext: {
          user: mockUser, // candidate role
          accessToken: 'test-token',
          isAuthenticated: true,
          isLoading: false,
        },
      }
    );
    // Should redirect to dashboard
    expect(screen.getByText('Dashboard Page')).toBeInTheDocument();
    expect(screen.queryByText('Employer Only Content')).not.toBeInTheDocument();
  });

  it('renders children when user has required role', () => {
    renderWithRoutes(
      <ProtectedRoute allowedRoles={['employer']}>
        <div>Employer Only Content</div>
      </ProtectedRoute>,
      {
        authContext: {
          user: mockEmployer,
          accessToken: 'test-token',
          isAuthenticated: true,
          isLoading: false,
        },
      }
    );
    expect(screen.getByText('Employer Only Content')).toBeInTheDocument();
  });

  it('renders children when allowedRoles includes user role', () => {
    renderWithRoutes(
      <ProtectedRoute allowedRoles={['candidate', 'employer']}>
        <div>Multi Role Content</div>
      </ProtectedRoute>,
      {
        authContext: {
          user: mockUser, // candidate
          accessToken: 'test-token',
          isAuthenticated: true,
          isLoading: false,
        },
      }
    );
    expect(screen.getByText('Multi Role Content')).toBeInTheDocument();
  });

  it('uses custom redirectTo prop', () => {
    renderWithRoutes(
      <ProtectedRoute redirectTo="/custom-login">
        <div>Protected Content</div>
      </ProtectedRoute>
    );
    // Not authenticated, should redirect to custom login
    expect(screen.getByText('Custom Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
