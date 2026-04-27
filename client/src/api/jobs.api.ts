import { Job, JobType, Paginated } from '../types';
import { api } from './client';

export interface JobFilters {
  search?: string;
  location?: string;
  type?: JobType;
  remote?: boolean;
  minSalary?: number;
  maxSalary?: number;
  tags?: string[];
  companyId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'postedAt' | 'salary';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateJobRequest {
  title: string;
  description: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  type: JobType;
  remote?: boolean;
  expiresAt?: Date;
  tags?: string[];
  companyId: string;
}

export interface UpdateJobRequest extends Partial<CreateJobRequest> {}

export const jobsApi = {
  // Get all jobs with filters
  getJobs: async (filters: JobFilters = {}): Promise<Paginated<Job>> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => params.append(`${key}[]`, v.toString()));
        } else {
          // Map frontend sortBy to server field names
          const paramKey = key === 'sortBy' && value === 'postedAt' ? 'sortBy' : key;
          const paramValue = key === 'sortBy' && value === 'postedAt' ? 'createdAt' : value.toString();
          params.append(paramKey, paramValue);
        }
      }
    });
    
    const queryString = params.toString();
    const url = queryString ? `/jobs?${queryString}` : '/jobs';
    return api.get<Paginated<Job>>(url);
  },

  // Get single job by ID
  getJob: async (id: string): Promise<Job> => {
    return api.get<Job>(`/jobs/${id}`);
  },

  // Search jobs
  searchJobs: async (query: string, filters: Partial<JobFilters> = {}): Promise<Paginated<Job>> => {
    return jobsApi.getJobs({ ...filters, search: query });
  },

  // Create new job (employer only)
  // Strip fields not in server schema (remote, tags, salaryCurrency, expiresAt)
  createJob: async (jobData: CreateJobRequest): Promise<Job> => {
    const { remote, tags, salaryCurrency, expiresAt, ...serverData } = jobData;
    return api.post<Job>('/jobs', serverData);
  },

  // Update job (employer/admin only)
  // Strip fields not in server schema
  updateJob: async (id: string, jobData: UpdateJobRequest): Promise<Job> => {
    const { remote, tags, salaryCurrency, expiresAt, ...serverData } = jobData;
    return api.put<Job>(`/jobs/${id}`, serverData);
  },

  // Delete job (employer/admin only)
  deleteJob: async (id: string): Promise<void> => {
    await api.delete(`/jobs/${id}`);
  },

  // Get jobs posted by current employer
  getMyJobs: async (filters: Partial<JobFilters> = {}): Promise<Paginated<Job>> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const url = queryString ? `/jobs/my?${queryString}` : '/jobs/my';
    return api.get<Paginated<Job>>(url);
  },

  // Get featured jobs
  getFeaturedJobs: async (limit: number = 6): Promise<Job[]> => {
    return api.get<Job[]>(`/jobs/featured?limit=${limit}`);
  },

  // Get similar jobs
  getSimilarJobs: async (jobId: string, limit: number = 4): Promise<Job[]> => {
    return api.get<Job[]>(`/jobs/${jobId}/similar?limit=${limit}`);
  },

  // Get job statistics
  getJobStats: async (): Promise<{
    total: number;
    byType: Record<JobType, number>;
    byLocation: Record<string, number>;
  }> => {
    return api.get('/jobs/stats');
  },
};