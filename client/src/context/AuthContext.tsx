import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'candidate' | 'employer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  resumeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ServerUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatarUrl?: string;
  resumeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: ServerUser;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'jobboard_access_token';
const REFRESH_TOKEN_KEY = 'jobboard_refresh_token';
const USER_KEY = 'jobboard_user';

// Map server role to client role
function mapServerRole(role: string): UserRole {
  const roleMap: Record<string, UserRole> = {
    'SEEKER': 'candidate',
    'EMPLOYER': 'employer',
    'ADMIN': 'admin',
  };
  return roleMap[role] || 'candidate';
}

// Map client role to server role
function mapClientRole(role: UserRole): string {
  const roleMap: Record<UserRole, string> = {
    'candidate': 'SEEKER',
    'employer': 'EMPLOYER',
    'admin': 'ADMIN',
  };
  return roleMap[role];
}

// Transform server user to client user
function transformServerUser(serverUser: ServerUser): User {
  return {
    id: serverUser.id,
    email: serverUser.email,
    name: `${serverUser.firstName} ${serverUser.lastName}`,
    firstName: serverUser.firstName,
    lastName: serverUser.lastName,
    role: mapServerRole(serverUser.role),
    ...(serverUser.avatarUrl != null && { avatarUrl: serverUser.avatarUrl }),
    ...(serverUser.resumeUrl != null && { resumeUrl: serverUser.resumeUrl }),
    createdAt: serverUser.createdAt,
    updatedAt: serverUser.updatedAt,
  };
}

// Get dashboard path based on user role
export function getDashboardPath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'employer':
      return '/employer/dashboard';
    case 'candidate':
    default:
      return '/seeker/dashboard';
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    
    if (token && storedUser) {
      try {
        setAccessToken(token);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Login failed');
      }

      const json = await response.json();
      // Server returns { success: true, data: { user, accessToken, refreshToken } }
      const data: AuthResponse = json.data || json;
      
      const clientUser = transformServerUser(data.user);
      
      // Store tokens and user
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(clientUser));
      
      setAccessToken(data.accessToken);
      setUser(clientUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      // Split name into firstName and lastName for server
      const nameParts = data.name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const requestBody = {
        email: data.email,
        password: data.password,
        firstName,
        lastName,
        role: mapClientRole(data.role),
      };

      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Registration failed');
      }

      const json = await response.json();
      // Server returns { success: true, data: { user, accessToken, refreshToken } }
      const authData: AuthResponse = json.data || json;
      
      const clientUser = transformServerUser(authData.user);
      
      // Store tokens and user
      localStorage.setItem(TOKEN_KEY, authData.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(clientUser));
      
      setAccessToken(authData.accessToken);
      setUser(clientUser);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Call logout API if token exists
      if (accessToken) {
        await fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setAccessToken(null);
      setUser(null);
    }
  };

  const refreshToken = async (): Promise<void> => {
    const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshTokenValue) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const json = await response.json();
      const data = json.data || json;
      localStorage.setItem(TOKEN_KEY, data.accessToken);
      setAccessToken(data.accessToken);
    } catch (error) {
      console.error('Token refresh error:', error);
      // Refresh failed, logout user
      await logout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    login,
    register,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
