import { Job, User, Company, Paginated } from '../types';
import { api } from './client';

export interface AdminStats {
  totalUsers: number;
  totalJobs: number;
  totalApplications: number;
  totalCompanies: number;
  pendingJobs: number;
  pendingApplications: number;
  recentUsers: User[];
  recentJobs: Job[];
  revenue?: number;
}

export interface ModerateJobRequest {
  status: 'approved' | 'rejected';
  reason?: string;
}

export const adminApi = {
  // Get admin dashboard statistics — server route is GET /moderation/stats
  getStats: async (): Promise<AdminStats> => {
    return api.get<AdminStats>('/moderation/stats');
  },

  // Get pending jobs for moderation — server route is GET /moderation/jobs/pending
  // Server returns { jobs: [...], pagination: { total, page, limit, totalPages } }
  // Normalize to Paginated<Job> format { data, total, page, limit, totalPages }
  getPendingJobs: async (page: number = 1, limit: number = 20): Promise<Paginated<Job>> => {
    const result = await api.get<any>(`/moderation/jobs/pending?page=${page}&limit=${limit}`);
    // Normalize server response format to Paginated<Job>
    if (result.jobs && result.pagination) {
      return {
        data: result.jobs,
        total: result.pagination.total,
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalPages: result.pagination.totalPages,
      };
    }
    // Already in Paginated format (or fallback)
    return result;
  },

  // Moderate a job (approve/reject) — server route is PUT /moderation/jobs/:id/moderate
  // Server expects status in UPPERCASE and uses 'rejectionReason' not 'reason'
  moderateJob: async (jobId: string, moderationData: ModerateJobRequest): Promise<Job> => {
    const serverData: any = {
      status: moderationData.status.toUpperCase(),
    };
    if (moderationData.reason) {
      serverData.rejectionReason = moderationData.reason;
    }
    return api.put<Job>(`/moderation/jobs/${jobId}/moderate`, serverData);
  },

  // Get all users with filters — server route is GET /users
  // Server returns { users: [...], pagination: { total, page, limit, totalPages } }
  // Normalize to Paginated<User> format { data, total, page, limit, totalPages }
  getUsers: async (page: number = 1, limit: number = 50, search?: string): Promise<Paginated<User>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    
    const result = await api.get<any>(`/users?${params.toString()}`);
    // Normalize server response format to Paginated<User>
    if (result.users && result.pagination) {
      // Map firstName/lastName to name for each user
      const mappedUsers = result.users.map((u: any) => ({
        ...u,
        name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email,
      }));
      return {
        data: mappedUsers,
        total: result.pagination.total,
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalPages: result.pagination.totalPages,
      };
    }
    // Already in Paginated format (or fallback)
    return result;
  },

  // Update user role — server route is PUT /users/:id/role
  updateUserRole: async (userId: string, role: string): Promise<User> => {
    return api.put<User>(`/users/${userId}/role`, { role });
  },

  // Deactivate user — server route is DELETE /users/:id
  deactivateUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`);
  },

  // Get all companies — server route is GET /companies
  getCompanies: async (page: number = 1, limit: number = 50, search?: string): Promise<Paginated<Company>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    
    return api.get<Paginated<Company>>(`/companies?${params.toString()}`);
  },

  // Update company verification status — server route is PUT /moderation/companies/:id/moderate
  verifyCompany: async (companyId: string, verified: boolean): Promise<Company> => {
    return api.put<Company>(`/moderation/companies/${companyId}/moderate`, {
      status: verified ? 'VERIFIED' : 'REJECTED',
    });
  },

  // Get system logs — server route is GET /moderation/logs
  getLogs: async (page: number = 1, limit: number = 100, level?: string): Promise<Paginated<any>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (level) params.append('level', level);
    
    return api.get<Paginated<any>>(`/moderation/logs?${params.toString()}`);
  },

  // Get revenue statistics — no dedicated server route, returns placeholder
  getRevenueStats: async (_startDate?: Date, _endDate?: Date): Promise<any> => {
    // No server route for revenue; return empty stats
    return { total: 0, byMonth: {} };
  },

  // Send system notification — no server route, placeholder
  sendNotification: async (_userId: string, _title: string, _message: string): Promise<void> => {
    // No server route for individual notifications
    console.warn('sendNotification: no server route implemented');
  },

  // Broadcast notification to all users — no server route, placeholder
  broadcastNotification: async (_title: string, _message: string): Promise<void> => {
    // No server route for broadcast notifications
    console.warn('broadcastNotification: no server route implemented');
  },

  // Get application statistics — no dedicated server route, uses moderation stats
  getApplicationStats: async (): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byJob: Record<string, number>;
    byMonth: Record<string, number>;
  }> => {
    return api.get('/moderation/stats');
  },

  // Export data — no server route, placeholder
  exportData: async (_type: 'users' | 'jobs' | 'applications' | 'companies'): Promise<Blob> => {
    // No server route for export; return empty blob
    return new Blob([], { type: 'text/csv' });
  },
};