import { api } from './client';

export interface UploadResponse {
  url: string;
  key: string;
  size: number;
  mimetype: string;
}

export const uploadApi = {
  // Upload single file
  uploadFile: async (file: File, type: 'avatar' | 'resume' | 'logo' | 'document'): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    return api.post<UploadResponse>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload multiple files
  uploadFiles: async (files: File[], type: 'document'): Promise<UploadResponse[]> => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });
    formData.append('type', type);
    
    return api.post<UploadResponse[]>('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Delete uploaded file
  deleteFile: async (key: string): Promise<void> => {
    await api.delete(`/upload/${key}`);
  },

  // Get upload limits
  getUploadLimits: async (): Promise<{
    maxFileSize: number;
    allowedTypes: string[];
    maxFiles: number;
  }> => {
    return api.get('/upload/limits');
  },

  // Upload resume with progress tracking
  uploadResumeWithProgress: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'resume');
    
    return api.post<UploadResponse>('/upload/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },

  // Upload avatar with cropping
  uploadAvatar: async (
    file: File,
    crop?: { x: number; y: number; width: number; height: number }
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'avatar');
    
    if (crop) {
      formData.append('crop', JSON.stringify(crop));
    }
    
    return api.post<UploadResponse>('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Upload company logo
  uploadLogo: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'logo');
    
    return api.post<UploadResponse>('/upload/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get temporary upload URL
  getUploadUrl: async (filename: string, type: string): Promise<{ url: string; fields: Record<string, string> }> => {
    return api.post<{ url: string; fields: Record<string, string> }>('/upload/url', {
      filename,
      type,
    });
  },
};