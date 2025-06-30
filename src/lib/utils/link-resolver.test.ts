// @ts-nocheck
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { linkResolver } from './link-resolver.js';

// Mock file system operations
vi.mock('node:fs/promises', () => ({
  default: {
    readdir: vi.fn(),
    readFile: vi.fn(),
  },
  readdir: vi.fn(),
  readFile: vi.fn(),
}));

// Mock denote utilities
vi.mock('./denote.js', () => ({
  extractSlugFromFilename: vi.fn(),
  extractIdentifierFromFilename: vi.fn()
}));

// Mock config
vi.mock('../../config.js', () => ({
  CONFIG: {
    CONTENT_DIR: 'content',
    ORG_FILE_EXTENSION: '.org',
    IDENTIFIER_PATTERN: /#\+identifier:\s*(.+)/i
  },
  createProcessingError: vi.fn((message, code) => ({
    message: `${code}: ${message}`,
    name: 'ProcessingError',
    code,
    retryable: false
  }))
}));

import { readdir, readFile } from 'node:fs/promises';
import { extractSlugFromFilename, extractIdentifierFromFilename } from './denote.js';
import { createProcessingError } from '../../config.js';

const mockReaddir = vi.mocked(readdir);
const mockReadFile = vi.mocked(readFile);
const mockExtractSlug = vi.mocked(extractSlugFromFilename);
const mockExtractIdentifier = vi.mocked(extractIdentifierFromFilename);
const mockCreateProcessingError = vi.mocked(createProcessingError);

describe('LinkResolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    linkResolver.clearCache(); // Reset state between tests
  });

  afterEach(() => {
    linkResolver.clearCache();
  });

  describe('resolveIdentifierToSlug', () => {
    test('resolves identifier from filename', async () => {
      // Mock file system
      mockReaddir.mockResolvedValue(['20240326T195811--lxd__containers.org']);
      mockReadFile.mockResolvedValue('#+identifier: 20240326T195811\n#+title: LXD\n\nContent here');
      
      // Mock utilities
      mockExtractSlug.mockReturnValue('lxd');
      mockExtractIdentifier.mockReturnValue('20240326T195811');

      const result = await linkResolver.resolveIdentifierToSlug('20240326T195811');

      expect(result).toBe('lxd');
      expect(mockReaddir).toHaveBeenCalledWith(expect.stringContaining('content'));
      expect(mockReadFile).toHaveBeenCalledWith(
        expect.stringContaining('20240326T195811--lxd__containers.org'),
        'utf-8'
      );
    });

    test('resolves identifier from content', async () => {
      mockReaddir.mockResolvedValue(['20240327T093642--docker__containers.org']);
      mockReadFile.mockResolvedValue('#+identifier: 20240326T195811\n#+title: Docker\n\nContent here');
      
      mockExtractSlug.mockReturnValue('docker');
      mockExtractIdentifier.mockReturnValue('20240327T093642'); // Different from content identifier
      
      // Should find by content identifier even if filename identifier differs
      const result = await linkResolver.resolveIdentifierToSlug('20240326T195811');

      expect(result).toBe('docker');
    });

    test('returns null for non-existent identifier', async () => {
      mockReaddir.mockResolvedValue(['20240326T195811--lxd__containers.org']);
      mockReadFile.mockResolvedValue('#+identifier: 20240326T195811\n#+title: LXD');
      
      mockExtractSlug.mockReturnValue('lxd');
      mockExtractIdentifier.mockReturnValue('20240326T195811');

      const result = await linkResolver.resolveIdentifierToSlug('99999999T999999');

      expect(result).toBeNull();
    });

    test('handles invalid identifier input', async () => {
      const testCases = [
        null,
        undefined,
        '',
        123, // non-string
        {},  // object
      ];

      for (const invalidInput of testCases) {
        const result = await linkResolver.resolveIdentifierToSlug(invalidInput as any);
        expect(result).toBeNull();
      }
    });

    test('handles files without content identifier', async () => {
      mockReaddir.mockResolvedValue(['20240326T195811--lxd__containers.org']);
      mockReadFile.mockResolvedValue('#+title: LXD\n\nNo identifier in content'); // No #+identifier line
      
      mockExtractSlug.mockReturnValue('lxd');
      mockExtractIdentifier.mockReturnValue('20240326T195811');

      // Should still resolve by filename identifier
      const result = await linkResolver.resolveIdentifierToSlug('20240326T195811');

      expect(result).toBe('lxd');
    });

    test('handles files without filename identifier', async () => {
      mockReaddir.mockResolvedValue(['regular-file.org']);
      mockReadFile.mockResolvedValue('#+identifier: 20240326T195811\n#+title: Regular File');
      
      mockExtractSlug.mockReturnValue('regular-file');
      mockExtractIdentifier.mockReturnValue(null); // No identifier in filename

      // Should still resolve by content identifier
      const result = await linkResolver.resolveIdentifierToSlug('20240326T195811');

      expect(result).toBe('regular-file');
    });

    test('filters non-org files correctly', async () => {
      mockReaddir.mockResolvedValue([
        '20240326T195811--lxd__containers.org',
        'image.png',
        'README.md',
        'script.js'
      ]);
      
      mockReadFile.mockResolvedValue('#+identifier: 20240326T195811\n#+title: LXD');
      mockExtractSlug.mockReturnValue('lxd');
      mockExtractIdentifier.mockReturnValue('20240326T195811');

      await linkResolver.resolveIdentifierToSlug('20240326T195811');

      // Should only read the .org file
      expect(mockReadFile).toHaveBeenCalledTimes(1);
      expect(mockReadFile).toHaveBeenCalledWith(
        expect.stringContaining('.org'),
        'utf-8'
      );
    });

    test('caches results after initialization', async () => {
      mockReaddir.mockResolvedValue(['20240326T195811--lxd__containers.org']);
      mockReadFile.mockResolvedValue('#+identifier: 20240326T195811\n#+title: LXD');
      
      mockExtractSlug.mockReturnValue('lxd');
      mockExtractIdentifier.mockReturnValue('20240326T195811');

      // First call
      const result1 = await linkResolver.resolveIdentifierToSlug('20240326T195811');
      
      // Second call should use cache
      const result2 = await linkResolver.resolveIdentifierToSlug('20240326T195811');

      expect(result1).toBe('lxd');
      expect(result2).toBe('lxd');
      
      // File system should only be accessed once (during initialization)
      expect(mockReaddir).toHaveBeenCalledTimes(1);
      expect(mockReadFile).toHaveBeenCalledTimes(1);
    });

    test('handles multiple files with different identifiers', async () => {
      mockReaddir.mockResolvedValue([
        '20240326T195811--lxd__containers.org',
        '20240327T093642--docker__containers.org'
      ]);
      
      mockReadFile
        .mockResolvedValueOnce('#+identifier: 20240326T195811\n#+title: LXD')
        .mockResolvedValueOnce('#+identifier: 20240327T093642\n#+title: Docker');
      
      mockExtractSlug
        .mockReturnValueOnce('lxd')
        .mockReturnValueOnce('docker');
        
      mockExtractIdentifier
        .mockReturnValueOnce('20240326T195811')
        .mockReturnValueOnce('20240327T093642');

      const result1 = await linkResolver.resolveIdentifierToSlug('20240326T195811');
      const result2 = await linkResolver.resolveIdentifierToSlug('20240327T093642');

      expect(result1).toBe('lxd');
      expect(result2).toBe('docker');
    });
  });

  describe('error handling', () => {
    test('handles readdir errors gracefully', async () => {
      mockReaddir.mockRejectedValue(new Error('Permission denied'));
      mockCreateProcessingError.mockReturnValue({
        message: 'RESOLVER_INIT_FAILED: Link resolver initialization failed',
        name: 'ProcessingError',
        code: 'RESOLVER_INIT_FAILED',
        retryable: false
      } as any);

      await expect(linkResolver.resolveIdentifierToSlug('20240326T195811'))
        .rejects.toThrow('RESOLVER_INIT_FAILED');

      expect(mockCreateProcessingError).toHaveBeenCalledWith(
        'Link resolver initialization failed',
        'RESOLVER_INIT_FAILED'
      );
    });

    test('handles readFile errors gracefully', async () => {
      mockReaddir.mockResolvedValue(['20240326T195811--lxd__containers.org']);
      mockReadFile.mockRejectedValue(new Error('File not found'));
      mockCreateProcessingError.mockReturnValue({
        message: 'RESOLVER_INIT_FAILED: Link resolver initialization failed',
        name: 'ProcessingError',
        code: 'RESOLVER_INIT_FAILED',
        retryable: false
      } as any);

      await expect(linkResolver.resolveIdentifierToSlug('20240326T195811'))
        .rejects.toThrow('RESOLVER_INIT_FAILED');
    });

    test('handles malformed identifier patterns', async () => {
      mockReaddir.mockResolvedValue(['20240326T195811--lxd__containers.org']);
      mockReadFile.mockResolvedValue('#+identifier: \n#+title: LXD'); // Empty identifier
      
      mockExtractSlug.mockReturnValue('lxd');
      mockExtractIdentifier.mockReturnValue('20240326T195811');

      // Should still work with filename identifier
      const result = await linkResolver.resolveIdentifierToSlug('20240326T195811');
      expect(result).toBe('lxd');
    });

    test('handles utility function errors', async () => {
      mockReaddir.mockResolvedValue(['20240326T195811--lxd__containers.org']);
      mockReadFile.mockResolvedValue('#+identifier: 20240326T195811\n#+title: LXD');
      
      mockExtractSlug.mockImplementation(() => { throw new Error('Slug extraction failed'); });
      mockCreateProcessingError.mockReturnValue({
        message: 'RESOLVER_INIT_FAILED: Link resolver initialization failed',
        name: 'ProcessingError',
        code: 'RESOLVER_INIT_FAILED',
        retryable: false
      } as any);

      await expect(linkResolver.resolveIdentifierToSlug('20240326T195811'))
        .rejects.toThrow('RESOLVER_INIT_FAILED');
    });
  });

  describe('cache management', () => {
    test('clearCache resets state correctly', async () => {
      mockReaddir.mockResolvedValue(['20240326T195811--lxd__containers.org']);
      mockReadFile.mockResolvedValue('#+identifier: 20240326T195811\n#+title: LXD');
      
      mockExtractSlug.mockReturnValue('lxd');
      mockExtractIdentifier.mockReturnValue('20240326T195811');

      // Initialize cache
      await linkResolver.resolveIdentifierToSlug('20240326T195811');
      expect(mockReaddir).toHaveBeenCalledTimes(1);

      // Clear cache
      linkResolver.clearCache();

      // Next call should re-initialize
      await linkResolver.resolveIdentifierToSlug('20240326T195811');
      expect(mockReaddir).toHaveBeenCalledTimes(2);
    });

    test('multiple cache keys for same file', async () => {
      mockReaddir.mockResolvedValue(['20240326T195811--lxd__containers.org']);
      mockReadFile.mockResolvedValue('#+identifier: different-id\n#+title: LXD'); // Content ID differs from filename
      
      mockExtractSlug.mockReturnValue('lxd');
      mockExtractIdentifier.mockReturnValue('20240326T195811');

      // Should be accessible by both filename identifier and content identifier
      const result1 = await linkResolver.resolveIdentifierToSlug('20240326T195811'); // filename ID
      const result2 = await linkResolver.resolveIdentifierToSlug('different-id'); // content ID

      expect(result1).toBe('lxd');
      expect(result2).toBe('lxd');
      
      // Should only initialize once
      expect(mockReaddir).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    test('handles empty content directory', async () => {
      mockReaddir.mockResolvedValue([]);

      const result = await linkResolver.resolveIdentifierToSlug('20240326T195811');

      expect(result).toBeNull();
      expect(mockReadFile).not.toHaveBeenCalled();
    });

    test('handles directory with only non-org files', async () => {
      mockReaddir.mockResolvedValue(['image.png', 'README.md', 'style.css']);

      const result = await linkResolver.resolveIdentifierToSlug('20240326T195811');

      expect(result).toBeNull();
      expect(mockReadFile).not.toHaveBeenCalled();
    });

    test('handles files with complex identifier patterns', async () => {
      mockReaddir.mockResolvedValue(['20240326T195811--lxd__containers.org']);
      mockReadFile.mockResolvedValue(`
#+identifier: 20240326T195811
#+IDENTIFIER: should-not-match-case-sensitive
#+title: LXD
      `);
      
      mockExtractSlug.mockReturnValue('lxd');
      mockExtractIdentifier.mockReturnValue('20240326T195811');

      const result = await linkResolver.resolveIdentifierToSlug('20240326T195811');

      expect(result).toBe('lxd');
    });
  });
});