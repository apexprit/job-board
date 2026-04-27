import { useAuth as useAuthContext } from '../context/AuthContext';

/**
 * Custom hook to access authentication state and methods
 * 
 * @example
 * const { user, isAuthenticated, login, logout } = useAuth();
 */
export const useAuth = () => {
  return useAuthContext();
};