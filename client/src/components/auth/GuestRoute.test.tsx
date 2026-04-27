import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders as render, mockUser } from '../../test/utils';
import GuestRoute from './GuestRoute';

describe('GuestRoute Component', () => {
  it('renders children when not authenticated', () => {
    render(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>
    );
    expect(screen.getByText('Guest Content')).toBeInTheDocument();
  });

  it('redirects to dashboard when authenticated', () => {
    render(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>,
      {
        authContext: {
          user: mockUser,
          accessToken: 'test-token',
          isAuthenticated: true,
          isLoading: false,
        },
      }
    );
    // Should not show guest content (redirected to /dashboard)
    expect(screen.queryByText('Guest Content')).not.toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    const { container } = render(
      <GuestRoute>
        <div>Guest Content</div>
      </GuestRoute>,
      {
        authContext: {
          isLoading: true,
        },
      }
    );
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    expect(screen.queryByText('Guest Content')).not.toBeInTheDocument();
  });

  it('does not show spinner when showLoading is false', () => {
    const { container } = render(
      <GuestRoute showLoading={false}>
        <div>Guest Content</div>
      </GuestRoute>,
      {
        authContext: {
          isLoading: true,
        },
      }
    );
    expect(container.querySelector('.animate-spin')).not.toBeInTheDocument();
  });

  it('uses custom redirectTo prop', () => {
    render(
      <GuestRoute redirectTo="/home">
        <div>Guest Content</div>
      </GuestRoute>,
      {
        authContext: {
          user: mockUser,
          accessToken: 'test-token',
          isAuthenticated: true,
          isLoading: false,
        },
      }
    );
    // Authenticated user should be redirected
    expect(screen.queryByText('Guest Content')).not.toBeInTheDocument();
  });
});
