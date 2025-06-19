import { describe, test, expect } from 'vitest';
import { 
  extractSlugFromFilename, 
  parseDenoteFilename, 
  isDenoteFilename,
  extractIdentifierFromFilename 
} from './denote.js';

describe('Denote filename utilities', () => {
  describe('extractSlugFromFilename', () => {
    test('extracts slug from standard Denote filename', () => {
      const filename = '20240326T195811--lxd__lxd_ubuntu.org';
      const result = extractSlugFromFilename(filename);
      expect(result).toBe('lxd');
    });

    test('extracts slug from filename without tags', () => {
      const filename = '20240326T195811--my-awesome-post.org';
      const result = extractSlugFromFilename(filename);
      expect(result).toBe('my-awesome-post');
    });

    test('handles filename without .org extension', () => {
      const filename = '20240326T195811--test-post__web_dev';
      const result = extractSlugFromFilename(filename);
      expect(result).toBe('test-post');
    });

    test('handles complex titles with multiple hyphens', () => {
      const filename = '20240326T195811--my-very-long-title-here__tag1_tag2.org';
      const result = extractSlugFromFilename(filename);
      expect(result).toBe('my-very-long-title-here');
    });

    test('converts to lowercase', () => {
      const filename = '20240326T195811--My-AWESOME-Post__web.org';
      const result = extractSlugFromFilename(filename);
      expect(result).toBe('my-awesome-post');
    });
  });

  describe('parseDenoteFilename', () => {
    test('parses complete Denote filename with tags', () => {
      const filename = '20240326T195811--lxd__lxd_ubuntu.org';
      const result = parseDenoteFilename(filename);
      
      expect(result).not.toBeNull();
      expect(result!.identifier).toBe('20240326T195811');
      expect(result!.title).toBe('lxd');
      expect(result!.slug).toBe('lxd');
      expect(result!.tags).toEqual(['lxd', 'ubuntu']);
      expect(result!.originalFilename).toBe(filename);
    });

    test('parses filename without tags', () => {
      const filename = '20240326T195811--simple-post.org';
      const result = parseDenoteFilename(filename);
      
      expect(result).not.toBeNull();
      expect(result!.identifier).toBe('20240326T195811');
      expect(result!.title).toBe('simple post');
      expect(result!.slug).toBe('simple-post');
      expect(result!.tags).toEqual([]);
    });

    test('returns null for invalid filename', () => {
      const filename = 'not-a-denote-file.org';
      const result = parseDenoteFilename(filename);
      
      expect(result).toBeNull();
    });

    test('handles title with hyphens correctly', () => {
      const filename = '20240326T195811--my-awesome-post__web_dev.org';
      const result = parseDenoteFilename(filename);
      
      expect(result).not.toBeNull();
      expect(result!.title).toBe('my awesome post');
      expect(result!.slug).toBe('my-awesome-post');
    });
  });

  describe('isDenoteFilename', () => {
    test('returns true for valid Denote filenames', () => {
      const validFilenames = [
        '20240326T195811--lxd__lxd_ubuntu.org',
        '20240326T195811--simple-post.org',
        '20240326T195811--test__tag1_tag2_tag3.org',
      ];

      validFilenames.forEach(filename => {
        expect(isDenoteFilename(filename)).toBe(true);
      });
    });

    test('returns false for invalid filenames', () => {
      const invalidFilenames = [
        'regular-file.org',
        '2024-03-26--missing-time.org',
        '20240326--missing-T.org',
        '20240326T1958--incomplete-time.org',
        'not-a-denote-file.txt',
      ];

      invalidFilenames.forEach(filename => {
        expect(isDenoteFilename(filename)).toBe(false);
      });
    });
  });

  describe('extractIdentifierFromFilename', () => {
    test('extracts identifier from valid Denote filename', () => {
      const filename = '20240326T195811--lxd__lxd_ubuntu.org';
      const result = extractIdentifierFromFilename(filename);
      expect(result).toBe('20240326T195811');
    });

    test('extracts identifier from filename without extension', () => {
      const filename = '20240326T195811--test-post';
      const result = extractIdentifierFromFilename(filename);
      expect(result).toBe('20240326T195811');
    });

    test('returns null for invalid filename', () => {
      const filename = 'not-a-denote-file.org';
      const result = extractIdentifierFromFilename(filename);
      expect(result).toBeNull();
    });
  });
});