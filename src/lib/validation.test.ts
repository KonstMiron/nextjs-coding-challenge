import { describe, it, expect } from 'vitest';
import { sanitizePlayerName, isValidProgress, isValidSessionId, isValidPlayerId } from './validation';

describe('Validation utilities', () => {
  describe('sanitizePlayerName', () => {
    it('trims whitespace', () => {
      expect(sanitizePlayerName('  John  ')).toBe('John');
    });

    it('removes dangerous characters', () => {
      expect(sanitizePlayerName('John<script>')).toBe('Johnscript');
      expect(sanitizePlayerName('Mary>alert')).toBe('Maryalert');
    });

    it('limits length to 50 characters', () => {
      const longName = 'a'.repeat(100);
      expect(sanitizePlayerName(longName).length).toBe(50);
    });
  });

  describe('isValidProgress', () => {
    it('returns true for valid progress', () => {
      expect(isValidProgress('Hello', 'Hello World')).toBe(true);
    });

    it('returns false if progress too long', () => {
      expect(isValidProgress('Hello World Extra Text', 'Hello World')).toBe(false);
    });

    it('returns false for non-string', () => {
      expect(isValidProgress(123 as any, 'Hello')).toBe(false);
    });
  });

  describe('isValidSessionId', () => {
    it('accepts valid session ID', () => {
      expect(isValidSessionId('abc123_-')).toBe(true);
    });

    it('rejects invalid characters', () => {
      expect(isValidSessionId('abc@123')).toBe(false);
    });
  });
});
