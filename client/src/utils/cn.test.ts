import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn utility', () => {
  it('joins multiple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('filters out falsy values', () => {
    expect(cn('foo', false, null, undefined, '', 'bar')).toBe('foo bar');
  });

  it('returns empty string for all falsy values', () => {
    expect(cn(false, null, undefined, '')).toBe('');
  });

  it('returns single class name', () => {
    expect(cn('foo')).toBe('foo');
  });

  it('handles no arguments', () => {
    expect(cn()).toBe('');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe('base active');
  });
});
