import { Application, ApplicationStatus, Paginated } from '../types';
import { api } from './client';

// Map frontend application status to server enum values for query params
const APPLICATION_STATUS_SERVER_MAP: Record<string, string> = {
  'pending': 'PENDING',
  'reviewed': 'REVIEWED',
  'accepted': 'SHORTLISTED',
  'rejected': 'REJECTED',
  'withdrawn': 'WITHDRAWN',
};

export interface ApplyForJobRequest {
  coverLetter?: string;
  resumeUrl?: string;
}

export interface UpdateApplicationRequest {
  status?: ApplicationStatus;
  notes?: string;
}

export interface ApplicationFilters {
  status?: ApplicationStatus;
  jobId?: string;
  userId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'appliedAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// Helper to transform filter params for server (enum values must be UPPERCASE)
const buildServerParams = (filters: Record<string, any>): URLSearchParams => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'status' && typeof value === 'string') {
        // Transform frontend status to server enum
        params.append(key, APPLICATION_STATUS_SERVER_MAP[value] || value.toUpperCase());
      } else {
        params.append(key, value.toString());
      }
    }
  });
  return params;
};

export const applicationsApi = {
  // Apply for a job — server expects POST /applications with jobId in body
  applyForJob: async (jobId: string, applicationData: ApplyForJobRequest): Promise<Application> => {
    return api.post<Application>('/applications', { ...applicationData, jobId });
  },

  // Get applications for current user (candidate) — server route is /applications/seeker
  getMyApplications: async (filters: ApplicationFilters = {}): Promise<Paginated<Application>> => {
    const params = buildServerParams(filters);
    const queryString = params.toString();
    const url = queryString ? `/applications/seeker?${queryString}` : '/applications/seeker';
    return api.get<Paginated<Application>>(url);
  },

  // Get applications for a specific job (employer) — server route is /applications/job/:jobId
  getJobApplications: async (jobId: string, filters: Omit<ApplicationFilters, 'jobId'> = {}): Promise<Paginated<Application>> => {
    const params = buildServerParams(filters);
    const queryString = params.toString();
    const url = queryString ? `/applications/job/${jobId}?${queryString}` : `/applications/job/${jobId}`;
    return api.get<Paginated<Application>>(url);
  },

  // Get single application
  getApplication: async (id: string): Promise<Application> => {
    return api.get<Application>(`/applications/${id}`);
  },

  // Update application status (employer/admin) — server route is PATCH /applications/:id/status
  updateApplication: async (id: string, updateData: UpdateApplicationRequest): Promise<Application> => {
    return api.patch<Application>(`/applications/${id}/status`, updateData);
  },

  // Withdraw application (candidate) — server route is DELETE /applications/:id
  withdrawApplication: async (id: string): Promise<void> => {
    await api.delete(`/applications/${id}`);
  },

  // Get application statistics for employer — no dedicated server route, uses moderation stats
  getApplicationStats: async (_jobId?: string): Promise<{
    total: number;
    byStatus: Record<ApplicationStatus, number>;
    recent: Application[];
  }> => {
    // No dedicated /applications/stats route on server; use moderation stats
    return api.get('/moderation/stats');
  },

  // Export applications as CSV — no server route, placeholder
  exportApplications: async (_jobId?: string): Promise<Blob> => {
    // No server route for export; return empty blob
    return new Blob([], { type: 'text/csv' });
  },

  // Send application notification — no server route, placeholder
  sendNotification: async (_applicationId: string, _message: string): Promise<void> => {
    // No server route for application notifications
    console.warn('sendNotification: no server route implemented');
  },
};