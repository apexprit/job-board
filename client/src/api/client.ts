import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface ApiError {
  message: string;
  status: number;
  details?: any;
}

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jobboard_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // If error is 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('jobboard_refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Attempt to refresh token
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const refreshData = refreshResponse.data?.data || refreshResponse.data;
        const { accessToken } = refreshData;
        localStorage.setItem('jobboard_access_token', accessToken);
        
        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        localStorage.removeItem('jobboard_access_token');
        localStorage.removeItem('jobboard_refresh_token');
        localStorage.removeItem('jobboard_user');
        
        // Redirect to login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      }
    }

    // Transform error to our format
    const responseData = error.response?.data as any;
    const apiError: ApiError = {
      message: responseData?.error || responseData?.message || error.message || 'An error occurred',
      status: error.response?.status || 500,
      details: responseData,
    };

    return Promise.reject(apiError);
  }
);

// Enum mapping: server uses UPPERCASE_WITH_UNDERSCORES, frontend uses lowercase-with-hyphens
const JOB_TYPE_MAP: Record<string, string> = {
  'FULL_TIME': 'full-time',
  'PART_TIME': 'part-time',
  'CONTRACT': 'contract',
  'INTERNSHIP': 'internship',
  'REMOTE': 'remote',
};

const USER_ROLE_MAP: Record<string, string> = {
  'SEEKER': 'candidate',
  'EMPLOYER': 'employer',
  'ADMIN': 'admin',
};

const APPLICATION_STATUS_MAP: Record<string, string> = {
  'PENDING': 'pending',
  'REVIEWED': 'reviewed',
  'SHORTLISTED': 'accepted',
  'REJECTED': 'rejected',
  'HIRED': 'accepted',
  'WITHDRAWN': 'withdrawn',
};

const JOB_STATUS_MAP: Record<string, string> = {
  'PENDING': 'pending',
  'APPROVED': 'approved',
  'REJECTED': 'rejected',
  'CLOSED': 'closed',
};

// Reverse maps: frontend → server
const JOB_TYPE_MAP_REVERSE: Record<string, string> = {
  'full-time': 'FULL_TIME',
  'part-time': 'PART_TIME',
  'contract': 'CONTRACT',
  'internship': 'INTERNSHIP',
  'remote': 'REMOTE',
};

const USER_ROLE_MAP_REVERSE: Record<string, string> = {
  'candidate': 'SEEKER',
  'employer': 'EMPLOYER',
  'admin': 'ADMIN',
};

const APPLICATION_STATUS_MAP_REVERSE: Record<string, string> = {
  'pending': 'PENDING',
  'reviewed': 'REVIEWED',
  'accepted': 'SHORTLISTED',
  'rejected': 'REJECTED',
  'withdrawn': 'WITHDRAWN',
};

const JOB_STATUS_MAP_REVERSE: Record<string, string> = {
  'pending': 'PENDING',
  'approved': 'APPROVED',
  'rejected': 'REJECTED',
  'closed': 'CLOSED',
};

// Recursively transform enum values and map field names in response data (server → frontend)
const transformEnums = (data: any): any => {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) return data.map(transformEnums);
  if (typeof data === 'object') {
    const result: any = {};
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (typeof value === 'string') {
        // Transform known enum fields
        if (key === 'type' && JOB_TYPE_MAP[value]) {
          result[key] = JOB_TYPE_MAP[value];
        } else if (key === 'role' && USER_ROLE_MAP[value]) {
          result[key] = USER_ROLE_MAP[value];
        } else if (key === 'status' && (APPLICATION_STATUS_MAP[value] || JOB_STATUS_MAP[value])) {
          result[key] = APPLICATION_STATUS_MAP[value] || JOB_STATUS_MAP[value];
        } else {
          result[key] = value;
        }
      } else if (typeof value === 'object') {
        result[key] = transformEnums(value);
      } else {
        result[key] = value;
      }
    }

    // Transform byType keys in stats objects (e.g., FULL_TIME → full-time)
    if ('byType' in result && typeof result.byType === 'object') {
      const transformed: any = {};
      for (const [k, v] of Object.entries(result.byType)) {
        transformed[JOB_TYPE_MAP[k] || k] = v;
      }
      result.byType = transformed;
    }

    // Add missing/renamed fields for Job-like objects (have companyId + type)
    if ('companyId' in result && 'employerId' in result) {
      // Map createdAt → postedAt for frontend compatibility
      if (!('postedAt' in result) && 'createdAt' in result) {
        result.postedAt = result.createdAt;
      }
      // Frontend expects tags array but server doesn't have it
      if (!('tags' in result)) {
        result.tags = [];
      }
      // Frontend expects remote boolean — derive from type or location
      if (!('remote' in result)) {
        result.remote = result.type === 'remote' || (result.location && result.location.toLowerCase().includes('remote'));
      }
      // Frontend expects salaryCurrency
      if (!('salaryCurrency' in result)) {
        result.salaryCurrency = 'USD';
      }
    }

    // Add missing/renamed fields for Application-like objects (have seekerId + jobId)
    if ('seekerId' in result && 'jobId' in result) {
      // Map seekerId → userId for frontend compatibility
      if (!('userId' in result)) {
        result.userId = result.seekerId;
      }
      // Map createdAt → appliedAt for frontend compatibility
      if (!('appliedAt' in result) && 'createdAt' in result) {
        result.appliedAt = result.createdAt;
      }
    }

    // Add missing/renamed fields for Company-like objects (have websiteUrl)
    if ('websiteUrl' in result && !('website' in result)) {
      result.website = result.websiteUrl;
    }

    return result;
  }
  return data;
};

// Transform request data enums (frontend → server)
const transformRequestEnums = (data: any): any => {
  if (data === null || data === undefined) return data;
  if (Array.isArray(data)) return data.map(transformRequestEnums);
  if (typeof data === 'object') {
    const result: any = {};
    for (const key of Object.keys(data)) {
      const value = data[key];
      if (typeof value === 'string') {
        if (key === 'type' && JOB_TYPE_MAP_REVERSE[value]) {
          result[key] = JOB_TYPE_MAP_REVERSE[value];
        } else if (key === 'role' && USER_ROLE_MAP_REVERSE[value]) {
          result[key] = USER_ROLE_MAP_REVERSE[value];
        } else if (key === 'status') {
          // Try application status first, then job status
          result[key] = APPLICATION_STATUS_MAP_REVERSE[value] || JOB_STATUS_MAP_REVERSE[value] || value;
        } else {
          result[key] = value;
        }
      } else if (typeof value === 'object') {
        result[key] = transformRequestEnums(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }
  return data;
};

// Unwrap server response: server returns { success: true, data: ... }
// We want to extract the inner `data` field automatically and transform enums
const unwrapResponse = (responseData: any): any => {
  const unwrapped = (responseData && typeof responseData === 'object' && 'success' in responseData && 'data' in responseData)
    ? responseData.data
    : responseData;
  return transformEnums(unwrapped);
};

// Helper function for API calls
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config).then((res) => unwrapResponse(res.data)),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.post<T>(url, transformRequestEnums(data), config).then((res) => unwrapResponse(res.data)),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.put<T>(url, transformRequestEnums(data), config).then((res) => unwrapResponse(res.data)),
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, transformRequestEnums(data), config).then((res) => unwrapResponse(res.data)),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config).then((res) => unwrapResponse(res.data)),
};

export default apiClient;