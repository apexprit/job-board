/**
 * Utility function to conditionally join class names
 * Similar to clsx or classnames library
 */
export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}