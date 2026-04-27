import React, { ReactNode } from 'react';

type MaxWidthOption = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '7xl' | 'full';

interface PageContainerProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  maxWidth?: MaxWidthOption;
  padding?: boolean;
}

const PageContainer: React.FC<PageContainerProps> = ({
  title,
  subtitle,
  children,
  className = '',
  maxWidth = '7xl',
  padding = true,
}) => {
  const maxWidthClasses: Record<MaxWidthOption, string> = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Page Header */}
      {(title || subtitle) && (
        <div className="bg-white border-b border-gray-200">
          <div className={`${maxWidthClasses[maxWidth]} mx-auto ${padding ? 'px-4 sm:px-6 lg:px-8' : ''} py-8`}>
            {title && (
              <h1 className="text-3xl font-bold text-gray-900">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-2 text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className={`${maxWidthClasses[maxWidth]} mx-auto ${padding ? 'px-4 sm:px-6 lg:px-8 py-8' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;