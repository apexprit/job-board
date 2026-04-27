import { User, Paginated } from '../types';
import { api } from './client';

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  location?: string;
  phone?: string;
  website?: string;
  linkedin?: string;
  github?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserFilters {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

export const usersApi = {
  // Get current user profile — server route is GET /users/me
  getProfile: async (): Promise<User> => {
    return api.get<User>('/users/me');
  },

  // Update current user profile — server route is PUT /users/me
  updateProfile: async (profileData: UpdateProfileRequest): Promise<User> => {
    return api.put<User>('/users/me', profileData);
  },

  // Change password — server route is POST /users/me/change-password
  // Server requires confirmPassword; auto-fill from newPassword if not provided
  changePassword: async (passwordData: ChangePasswordRequest): Promise<void> => {
    const payload = {
      ...passwordData,
      confirmPassword: passwordData.confirmPassword || passwordData.newPassword,
    };
    await api.post('/users/me/change-password', payload);
  },

  // Upload avatar — server route is POST /users/me/avatar
  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return api.post<{ avatarUrl: string }>('/users/me/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload resume — server route is POST /users/me/resume
  uploadResume: async (file: File): Promise<{ resumeUrl: string }> => {
    const formData = new FormData();
    formData.append('resume', file);
    
    return api.post<{ resumeUrl: string }>('/users/me/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete resume — no server route, kept for future implementation
  deleteResume: async (): Promise<void> => {
    await api.delete('/users/me/resume');
  },

  // Get user by ID (admin only) — server route is GET /users/:id
  getUser: async (id: string): Promise<User> => {
    return api.get<User>(`/users/${id}`);
  },

  // Get all users (admin only) — server route is GET /users
  getUsers: async (filters: UserFilters = {}): Promise<Paginated<User>> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Transform role filter: frontend uses lowercase, server uses UPPERCASE
        if (key === 'role' && typeof value === 'string') {
          const ROLE_MAP: Record<string, string> = {
            'candidate': 'SEEKER',
            'employer': 'EMPLOYER',
            'admin': 'ADMIN',
          };
          params.append(key, ROLE_MAP[value] || value.toUpperCase());
        } else {
          params.append(key, value.toString());
        }
      }
    });
    
    const queryString = params.toString();
    const url = queryString ? `/users?${queryString}` : '/users';
    return api.get<Paginated<User>>(url);
  },

  // Update user role (admin only) — server route is PUT /users/:id/role
  updateUserRole: async (id: string, role: string): Promise<User> => {
    return api.put<User>(`/users/${id}/role`, { role });
  },

  // Deactivate user (admin only) — server route is DELETE /users/:id
  deactivateUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  // Get user statistics — no dedicated server route, uses moderation stats
  getUserStats: async (): Promise<{
    total: number;
    byRole: Record<string, number>;
    active: number;
    recent: User[];
  }> => {
    return api.get('/moderation/stats');
  },

  // Search users — server route is GET /users/search/all?q=...
  searchUsers: async (query: string, filters: Partial<UserFilters> = {}): Promise<Paginated<User>> => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    return api.get<Paginated<User>>(`/users/search/all?${params.toString()}`);
  },
};