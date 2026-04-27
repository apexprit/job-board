import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { Badge } from './Badge';
import { renderWithProviders as render } from '../../test/utils';

describe('Badge Component', () => {
  it('renders with default props', () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText('Default')).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    const { rerender } = render(<Badge variant="primary">Primary</Badge>);
    expect(screen.getByText('Primary')).toHaveClass('bg-primary-100');

    rerender(<Badge variant="success">Success</Badge>);
    expect(screen.getByText('Success')).toHaveClass('bg-green-100');

    rerender(<Badge variant="danger">Danger</Badge>);
    expect(screen.getByText('Danger')).toHaveClass('bg-red-100');

    rerender(<Badge variant="warning">Warning</Badge>);
    expect(screen.getByText('Warning')).toHaveClass('bg-yellow-100');

    rerender(<Badge variant="info">Info</Badge>);
    expect(screen.getByText('Info')).toHaveClass('bg-blue-100');

    rerender(<Badge variant="outline">Outline</Badge>);
    expect(screen.getByText('Outline')).toHaveClass('border');
  });

  it('renders with different sizes', () => {
    const { rerender } = render(<Badge size="sm">Small</Badge>);
    expect(screen.getByText('Small')).toHaveClass('text-xs');

    rerender(<Badge size="md">Medium</Badge>);
    expect(screen.getByText('Medium')).toHaveClass('text-sm');

    rerender(<Badge size="lg">Large</Badge>);
    expect(screen.getByText('Large')).toHaveClass('text-base');
  });

  it('applies rounded-full class when rounded', () => {
    render(<Badge rounded>Rounded</Badge>);
    expect(screen.getByText('Rounded')).toHaveClass('rounded-full');
  });

  it('does not apply rounded-full when not rounded', () => {
    render(<Badge>Not Rounded</Badge>);
    expect(screen.getByText('Not Rounded')).not.toHaveClass('rounded-full');
  });

  it('shows dot indicator when dot prop is true', () => {
    const { container } = render(<Badge dot>With Dot</Badge>);
    container.querySelector('.rounded-full.w-1\\.5.h-1\\.5');
    // Check for the dot element (small circle before text)
    expect(container.innerHTML).toContain('rounded-full');
  });

  it('shows remove button when removable', () => {
    const onRemove = vi.fn();
    render(<Badge removable onRemove={onRemove}>Removable</Badge>);
    const removeButton = screen.getByRole('button');
    expect(removeButton).toBeInTheDocument();
  });

  it('calls onRemove when remove button is clicked', () => {
    const onRemove = vi.fn();
    render(<Badge removable onRemove={onRemove}>Removable</Badge>);
    fireEvent.click(screen.getByRole('button'));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(<Badge className="custom-class">Custom</Badge>);
    expect(screen.getByText('Custom')).toHaveClass('custom-class');
  });
});
