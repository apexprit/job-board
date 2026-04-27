import { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react';
import { uploadApi } from '../../api/upload.api';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';

interface ResumeUploadProps {
  onUploadComplete?: (url: string) => void;
  initialUrl?: string;
  maxSizeMB?: number;
  allowedTypes?: string[];
}

const ResumeUpload = ({
  onUploadComplete,
  initialUrl,
  maxSizeMB = 5,
  allowedTypes = ['.pdf', '.doc', '.docx', '.txt'],
}: ResumeUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      setError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);

    // Create preview URL for PDF and images
    if (selectedFile.type === 'application/pdf' || selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const response = await uploadApi.uploadFile(file, 'resume');
      setSuccess(true);
      setPreviewUrl(response.url);
      onUploadComplete?.(response.url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const getFileIcon = () => {
    if (!file) return <FileText className="w-12 h-12 text-gray-400" />;
    
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="w-12 h-12 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-12 h-12 text-blue-500" />;
      case 'txt':
        return <FileText className="w-12 h-12 text-gray-500" />;
      default:
        return <FileText className="w-12 h-12 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* File input (hidden) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={allowedTypes.join(',')}
        className="hidden"
      />

      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          file ? 'border-primary-300 bg-primary-50' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
        onClick={handleBrowseClick}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          {file ? (
            <>
              {getFileIcon()}
              <div className="text-center">
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                  }}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Resume
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Upload your resume</p>
                <p className="text-sm text-gray-600 mt-1">
                  Drag and drop or <span className="text-primary-600 font-medium">browse files</span>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: {allowedTypes.join(', ')} • Max size: {maxSizeMB}MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">Resume uploaded successfully!</p>
        </div>
      )}

      {/* Preview section */}
      {previewUrl && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Resume Preview</h3>
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:text-primary-800"
            >
              Open in new tab
            </a>
          </div>
          <div className="border rounded-lg overflow-hidden">
            {previewUrl.endsWith('.pdf') ? (
              <iframe
                src={previewUrl}
                className="w-full h-96"
                title="Resume Preview"
              />
            ) : (
              <div className="p-6 bg-gray-50 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Preview not available for this file type</p>
                <a
                  href={previewUrl}
                  download
                  className="inline-block mt-3 text-sm text-primary-600 hover:text-primary-800"
                >
                  Download file
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;