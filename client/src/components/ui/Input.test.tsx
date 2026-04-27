import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { Input } from './Input';
import { renderWithProviders as render } from '../../test/utils';

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('renders with a label', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter email" />);
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('shows helper text when no error', () => {
    render(<Input helperText="Enter a valid email" />);
    expect(screen.getByText('Enter a valid email')).toBeInTheDocument();
  });

  it('does not show helper text when error is present', () => {
    render(<Input error="Error message" helperText="Helper text" />);
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('handles text input', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'hello@test.com' } });
    expect(input).toHaveValue('hello@test.com');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('renders with different input types', () => {
    const { rerender } = render(<Input type="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" />);
    // password inputs don't have textbox role
    expect(document.querySelector('input[type="password"]')).toBeInTheDocument();

    rerender(<Input type="number" />);
    // number inputs use spinbutton role
    expect(document.querySelector('input[type="number"]')).toBeInTheDocument();
  });

  it('applies error styling when error is present', () => {
    render(<Input error="Error" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-red-500');
  });

  it('applies disabled styling when disabled', () => {
    render(<Input disabled />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('cursor-not-allowed');
  });

  it('applies custom className', () => {
    render(<Input className="my-custom" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('my-custom');
  });
});
