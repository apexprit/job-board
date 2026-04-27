import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
  showPageNumbers?: boolean;
  showBoundaryNumbers?: boolean;
  showEllipsis?: boolean;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  showPageNumbers = true,
  showBoundaryNumbers = true,
  showEllipsis = true,
  showFirstLast = true,
  showPrevNext = true,
  className,
  size = 'md',
}) => {
  if (totalPages <= 1) {
    return null;
  }


  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if we're near the start
      if (currentPage <= 3) {
        end = Math.min(4, totalPages - 1);
      }

      // Adjust if we're near the end
      if (currentPage >= totalPages - 2) {
        start = Math.max(totalPages - 3, 2);
      }

      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push(showEllipsis ? '...' : start - 1);
      }

      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push(showEllipsis ? '...' : end + 1);
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageClick = (page: number | string) => {
    if (typeof page === 'number' && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const renderPageInfo = () => {
    if (!totalItems || !itemsPerPage) return null;

    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="text-sm text-gray-600">
        Showing {start} to {end} of {totalItems} results
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4', className)}>
      {renderPageInfo()}

      <nav className="flex items-center space-x-1" aria-label="Pagination">
        {showFirstLast && (
          <Button
            variant="outline"
            size={size}
            onClick={() => handlePageClick(1)}
            disabled={currentPage === 1}
            aria-label="First page"
          >
            <span className="sr-only">First</span>
            <ChevronLeft className="h-4 w-4" />
            <ChevronLeft className="h-4 w-4 -ml-2" />
          </Button>
        )}

        {showPrevNext && (
          <Button
            variant="outline"
            size={size}
            onClick={() => handlePageClick(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {showPageNumbers && (
          <div className="hidden sm:flex items-center space-x-1">
            {pageNumbers.map((page, index) => (
              <React.Fragment key={index}>
                {typeof page === 'number' ? (
                  <Button
                    variant={currentPage === page ? 'primary' : 'outline'}
                    size={size}
                    onClick={() => handlePageClick(page)}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </Button>
                ) : (
                  <span className="flex items-center justify-center h-10 w-10 text-gray-500">
                    <MoreHorizontal className="h-4 w-4" />
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {showPrevNext && (
          <Button
            variant="outline"
            size={size}
            onClick={() => handlePageClick(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <span className="sr-only">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {showFirstLast && (
          <Button
            variant="outline"
            size={size}
            onClick={() => handlePageClick(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
          >
            <span className="sr-only">Last</span>
            <ChevronRight className="h-4 w-4 -mr-2" />
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </nav>

      {showBoundaryNumbers && (
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </div>
      )}
    </div>
  );
};

// Simple pagination for mobile
export const SimplePagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}> = ({ currentPage, totalPages, onPageChange, className }) => {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </Button>
      <span className="text-sm text-gray-600">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </Button>
    </div>
  );
};