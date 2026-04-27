import React from 'react';
import { cn } from '../../utils/cn';

export interface TableColumn<T> {
  key: string;
  header: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  sortable?: boolean;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyField?: keyof T | ((row: T) => string);
  emptyMessage?: string;
  loading?: boolean;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  bordered?: boolean;
  className?: string;
  onRowClick?: (row: T, index: number) => void;
  headerClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string);
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  keyField = 'id',
  emptyMessage = 'No data available',
  loading = false,
  striped = true,
  hoverable = true,
  compact = false,
  bordered = false,
  className,
  onRowClick,
  headerClassName,
  rowClassName,
}: TableProps<T>) {
  const getRowKey = (row: T, index: number): string => {
    if (typeof keyField === 'function') {
      return keyField(row);
    }
    return String(row[keyField] || index);
  };

  const getRowClassName = (row: T, index: number): string => {
    const baseClass = cn(
      'transition-colors duration-150',
      striped && index % 2 === 0 && 'bg-gray-50',
      hoverable && 'hover:bg-gray-100',
      onRowClick && 'cursor-pointer'
    );

    const customClass = typeof rowClassName === 'function'
      ? rowClassName(row, index)
      : rowClassName;

    return cn(baseClass, customClass);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className={cn(
        'min-w-full divide-y divide-gray-200',
        compact ? 'text-sm' : 'text-base',
        bordered && 'border border-gray-200'
      )}>
        <thead className={cn('bg-gray-50', headerClassName)}>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  column.sortable && 'cursor-pointer hover:bg-gray-100'
                )}
                style={{ width: column.width }}
              >
                {column.header}
                {column.sortable && (
                  <span className="ml-1 inline-block">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr
              key={getRowKey(row, rowIndex)}
              className={getRowClassName(row, rowIndex)}
              onClick={() => onRowClick?.(row, rowIndex)}
            >
              {columns.map((column) => (
                <td
                  key={`${getRowKey(row, rowIndex)}-${column.key}`}
                  className={cn(
                    'px-4 py-3 whitespace-nowrap',
                    compact ? 'py-2' : 'py-3',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                >
                  {column.render
                    ? column.render(row[column.key], row, rowIndex)
                    : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Additional table components
export const TableContainer: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('bg-white rounded-lg shadow', className)}>
    {children}
  </div>
);

export const TableHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('px-6 py-4 border-b border-gray-200', className)}>
    {children}
  </div>
);

export const TableFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={cn('px-6 py-4 border-t border-gray-200 bg-gray-50', className)}>
    {children}
  </div>
);