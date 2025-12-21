import { describe, it, expect } from 'vitest';
import { parseDate, normalizePost } from './content.utils';

describe('content.server', () => {
  describe('parseDate', () => {
    it('returns current ISO string if dateStr is undefined', () => {
      // Mocking Date to ensure consistent result is hard without setup, 
      // but we can check if it returns a valid date string.
      // For strictness, let's just check it returns a string that looks like a date.
      const result = parseDate(undefined);
      expect(typeof result).toBe('string');
      expect(new Date(result).toString()).not.toBe('Invalid Date');
    });

    it('parses Org mode timestamps with time', () => {
      const input = '[2024-01-22 Mon 11:45]';
      const expected = '2024-01-22T11:45:00';
      expect(parseDate(input)).toBe(expected);
    });

    it('parses Org mode timestamps without time', () => {
      const input = '[2024-01-22 Mon]';
      const expected = '2024-01-22T00:00:00';
      expect(parseDate(input)).toBe(expected);
    });

    it('returns the input cleaned if it does not match org pattern', () => {
      const input = '2024-01-01';
      expect(parseDate(input)).toBe(input);
    });
  });

  describe('normalizePost', () => {
    const mockComponent = () => null;

    it('extracts slug from path', () => {
      const path = '/content/blog/post-1.org';
      const mod = { default: mockComponent, attributes: { title: 'Test' } };
      const post = normalizePost(path, mod);
      expect(post.slug).toBe('blog/post-1');
    });

    it('handles missing attributes gracefully', () => {
      const path = '/content/test.org';
      const mod = { default: mockComponent };
      const post = normalizePost(path, mod);
      expect(post.title).toBe('Untitled');
      expect(post.tags).toEqual([]);
    });

    it('parses tags string into array', () => {
      const path = '/content/test.org';
      const mod = { 
        default: mockComponent, 
        attributes: { filetags: ':tag1:tag2:' } 
      };
      const post = normalizePost(path, mod);
      expect(post.tags).toEqual(['tag1', 'tag2']);
    });
    
     it('parses tags string with spaces into array', () => {
      const path = '/content/test.org';
      const mod = { 
        default: mockComponent, 
        attributes: { filetags: 'tag1 tag2' } 
      };
      const post = normalizePost(path, mod);
      expect(post.tags).toEqual(['tag1', 'tag2']);
    });
  });
});
