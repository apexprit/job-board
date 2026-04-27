import React, { ReactNode } from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
  showLoading?: boolean;
}

const ForbiddenPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">Access Denied</h2>
      <p className="text-gray-600 mb-8">You don't have permission to access this page.</p>
      <Link
        to="/"
        className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
      >
        Go Back Home
      </Link>
    </div>
  </div>
);

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles = [],
  redirectTo = '/login',
  showLoading = true,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading && showLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page, saving the attempted location
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role if allowedRoles is specified
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // User doesn't have required role — show 403 Forbidden
    return <ForbiddenPage />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;