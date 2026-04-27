// Export API client and all API modules
export { api } from './client';
export type { ApiError } from './client';

export { authApi } from './auth.api';
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenResponse,
} from './auth.api';

export { jobsApi } from './jobs.api';
export type {
  JobFilters,
  CreateJobRequest,
  UpdateJobRequest,
} from './jobs.api';

export { applicationsApi } from './applications.api';
export type {
  ApplyForJobRequest,
  UpdateApplicationRequest,
  ApplicationFilters,
} from './applications.api';

export { companiesApi } from './companies.api';
export type {
  CompanyFilters,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from './companies.api';

export { usersApi } from './users.api';
export type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserFilters,
} from './users.api';

export { adminApi } from './admin.api';
export type {
  AdminStats,
  ModerateJobRequest,
} from './admin.api';

export { uploadApi } from './upload.api';
export type { UploadResponse } from './upload.api';

// Re-export types for convenience
export type {
  User,
  Company,
  Job,
  Application,
  UserRole,
  JobType,
  ApplicationStatus,
  Paginated,
  ApiResponse,
} from '../types';