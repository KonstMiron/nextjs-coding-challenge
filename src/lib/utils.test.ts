import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toContain('text-red-500');
    expect(result).toContain('bg-blue-500');
  });

  it('handles tailwind conflicts correctly', () => {
    const result = cn('p-4', 'p-8');
    expect(result).toBe('p-8');
  });

  it('handles conditional classes', () => {
    const result = cn('base-class', { 'active-class': true, 'inactive-class': false });
    expect(result).toContain('base-class');
    expect(result).toContain('active-class');
    expect(result).not.toContain('inactive-class');
  });
});
