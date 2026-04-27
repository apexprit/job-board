import { Company, Paginated } from '../types';
import { api } from './client';

export interface CompanyFilters {
  search?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export interface CreateCompanyRequest {
  name: string;
  description: string;
  logoUrl?: string;
  website?: string;
  location: string;
}

export interface UpdateCompanyRequest extends Partial<CreateCompanyRequest> {}

export const companiesApi = {
  // Get all companies
  getCompanies: async (filters: CompanyFilters = {}): Promise<Paginated<Company>> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const queryString = params.toString();
    const url = queryString ? `/companies?${queryString}` : '/companies';
    return api.get<Paginated<Company>>(url);
  },

  // Get single company by ID
  getCompany: async (id: string): Promise<Company> => {
    return api.get<Company>(`/companies/${id}`);
  },

  // Create new company (employer/admin)
  // Frontend uses 'website' but server expects 'websiteUrl'
  createCompany: async (companyData: CreateCompanyRequest): Promise<Company> => {
    const serverData: any = { ...companyData };
    if ('website' in serverData) {
      serverData.websiteUrl = serverData.website;
      delete serverData.website;
    }
    return api.post<Company>('/companies', serverData);
  },

  // Update company (employer/admin)
  updateCompany: async (id: string, companyData: UpdateCompanyRequest): Promise<Company> => {
    const serverData: any = { ...companyData };
    if ('website' in serverData) {
      serverData.websiteUrl = serverData.website;
      delete serverData.website;
    }
    return api.put<Company>(`/companies/${id}`, serverData);
  },

  // Delete company (admin only)
  deleteCompany: async (id: string): Promise<void> => {
    await api.delete(`/companies/${id}`);
  },

  // Get jobs for a specific company
  getCompanyJobs: async (companyId: string, page: number = 1, limit: number = 10): Promise<Paginated<any>> => {
    return api.get<Paginated<any>>(`/companies/${companyId}/jobs?page=${page}&limit=${limit}`);
  },

  // Get company statistics — no server route; returns placeholder
  getCompanyStats: async (_companyId: string): Promise<{
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    averageSalary?: number;
  }> => {
    console.warn('getCompanyStats: no server route implemented');
    return { totalJobs: 0, activeJobs: 0, totalApplications: 0 };
  },

  // Search companies
  searchCompanies: async (query: string, filters: Partial<CompanyFilters> = {}): Promise<Paginated<Company>> => {
    return companiesApi.getCompanies({ ...filters, search: query });
  },

  // Get featured companies — no server route; falls back to listing
  getFeaturedCompanies: async (limit: number = 8): Promise<Company[]> => {
    const result = await companiesApi.getCompanies({ limit });
    return result.data.slice(0, limit);
  },

  // Get my company (for employer) — no server route; returns placeholder
  getMyCompany: async (): Promise<Company | null> => {
    console.warn('getMyCompany: no server route implemented');
    return null;
  },

  // Update my company (for employer) — no server route; returns placeholder
  updateMyCompany: async (_companyData: UpdateCompanyRequest): Promise<Company | null> => {
    console.warn('updateMyCompany: no server route implemented');
    return null;
  },
};