import { FileText, Image, File, Download, ExternalLink } from 'lucide-react';
import { Button } from '../ui/Button';

interface FilePreviewProps {
  url: string;
  fileName?: string;
  fileType?: string;
  showDownload?: boolean;
  showOpen?: boolean;
  className?: string;
  height?: string;
}

const FilePreview = ({
  url,
  fileName,
  fileType,
  showDownload = true,
  showOpen = true,
  className = '',
  height = 'h-96',
}: FilePreviewProps) => {
  const getFileIcon = () => {
    const extension = fileName?.split('.').pop()?.toLowerCase() || '';
    
    if (fileType?.includes('pdf') || extension === 'pdf') {
      return <FileText className="w-12 h-12 text-red-500" />;
    }
    if (fileType?.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <Image className="w-12 h-12 text-blue-500" />;
    }
    if (['doc', 'docx'].includes(extension)) {
      return <FileText className="w-12 h-12 text-blue-600" />;
    }
    if (['txt', 'csv'].includes(extension)) {
      return <FileText className="w-12 h-12 text-gray-500" />;
    }
    return <File className="w-12 h-12 text-gray-400" />;
  };

  const canPreview = () => {
    const extension = fileName?.split('.').pop()?.toLowerCase() || '';
    return (
      fileType?.includes('pdf') ||
      fileType?.startsWith('image/') ||
      extension === 'pdf' ||
      ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)
    );
  };

  const renderPreview = () => {
    if (fileType?.includes('pdf') || fileName?.endsWith('.pdf')) {
      return (
        <iframe
          src={url}
          className={`w-full ${height}`}
          title={fileName || 'File Preview'}
        />
      );
    }
    
    if (fileType?.startsWith('image/') || 
        ['jpg', 'jpeg', 'png', 'gif', 'webp'].some(ext => fileName?.endsWith(`.${ext}`))) {
      return (
        <img
          src={url}
          alt={fileName || 'Preview'}
          className={`w-full ${height} object-contain bg-white`}
        />
      );
    }
    
    return (
      <div className="p-8 bg-gray-50 flex flex-col items-center justify-center h-full">
        {getFileIcon()}
        {fileName && (
          <p className="mt-4 text-gray-700 font-medium text-center max-w-xs truncate">
            {fileName}
          </p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          Preview not available for this file type
        </p>
      </div>
    );
  };

  return (
    <div className={`border rounded-lg overflow-hidden bg-white ${className}`}>
      {/* Header with actions */}
      {(fileName || showDownload || showOpen) && (
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            {getFileIcon()}
            <div>
              {fileName && (
                <p className="font-medium text-gray-900 truncate max-w-xs">
                  {fileName}
                </p>
              )}
              {fileType && (
                <p className="text-sm text-gray-500">
                  {fileType}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {showOpen && canPreview() && (
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </a>
              </Button>
            )}
            
            {showDownload && (
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <a
                  href={url}
                  download={fileName}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </Button>
            )}
          </div>
        </div>
      )}
      
      {/* Preview content */}
      <div className="bg-white">
        {renderPreview()}
      </div>
    </div>
  );
};

export default FilePreview;