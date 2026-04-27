import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardPath } from '../../context/AuthContext';

interface GuestRouteProps {
  children: ReactNode;
  redirectTo?: string;
  showLoading?: boolean;
}

const GuestRoute: React.FC<GuestRouteProps> = ({
  children,
  redirectTo,
  showLoading = true,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading && showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    // User is authenticated, redirect to role-based dashboard
    const dashboardPath = redirectTo || (user ? getDashboardPath(user.role) : '/login');
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;