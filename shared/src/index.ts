export type UserRole = 'candidate' | 'employer' | 'admin';

export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';

export type ApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected' | 'withdrawn';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  description: string;
  website?: string;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  companyId: string;
  company?: Company;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  type: JobType;
  remote: boolean;
  postedAt: Date;
  expiresAt?: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  coverLetter?: string;
  resumeUrl?: string;
  status: ApplicationStatus;
  appliedAt: Date;
  reviewedAt?: Date;
  notes?: string;
  job?: Job;
  user?: User;
}

// Utility types
export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};