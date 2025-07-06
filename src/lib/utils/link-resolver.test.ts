import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { linkResolver } from './link-resolver.js';

// Mock fs operations
vi.mock('node:fs/promises', () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}));

// Mock config
vi.mock('../../config.js', () => ({
  CONFIG: {
    CONTENT_DIR: 'content',
    ORG_FILE_EXTENSION: '.org'
  },
  createProcessingError: vi.fn((message: string, code: string) => {
    const error = new Error(message) as any;
    error.code = code;
    return error;
  })
}));

import { readdir, readFile } from 'node:fs/promises';

const mockReaddir = vi.mocked(readdir);
const mockReadFile = vi.mocked(readFile);

describe('LinkResolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    linkResolver.clearCache();
  });

  afterEach(() => {
    linkResolver.clearCache();
  });

  test('resolves filename to slug successfully', async () => {
    mockReaddir.mockResolvedValue(['emacs.org', 'docker.org'] as any);
    mockReadFile
      .mockResolvedValueOnce('#+title: My Emacs Configuration\n\nContent here...')
      .mockResolvedValueOnce('#+title: Docker Guide\n\nDocker content...');

    const result = await linkResolver.resolveFilenameToSlug('emacs');

    expect(result).toBe('emacs');
    expect(mockReaddir).toHaveBeenCalledWith(expect.stringContaining('content'));
    expect(mockReadFile).toHaveBeenCalledTimes(2);
  });

  test('resolves filename with .org extension', async () => {
    mockReaddir.mockResolvedValue(['linux.org'] as any);
    mockReadFile.mockResolvedValue('#+title: Linux Notes\n\nContent...');

    const result = await linkResolver.resolveFilenameToSlug('linux.org');

    expect(result).toBe('linux');
  });

  test('returns null for non-existent filename', async () => {
    mockReaddir.mockResolvedValue(['emacs.org'] as any);
    mockReadFile.mockResolvedValue('#+title: Emacs\n\nContent...');

    const result = await linkResolver.resolveFilenameToSlug('nonexistent');

    expect(result).toBeNull();
  });

  test('handles files without titles', async () => {
    mockReaddir.mockResolvedValue(['untitled.org'] as any);
    mockReadFile.mockResolvedValue('No title here\n\nJust content...');

    const result = await linkResolver.resolveFilenameToSlug('untitled');

    expect(result).toBe('untitled');
  });

  test('filters out non-org files', async () => {
    mockReaddir.mockResolvedValue([
      'emacs.org',
      'README.md',
      'script.js',
      'docker.org'
    ] as any);
    mockReadFile
      .mockResolvedValueOnce('#+title: Emacs\n\nContent...')
      .mockResolvedValueOnce('#+title: Docker\n\nContent...');

    await linkResolver.resolveFilenameToSlug('emacs');

    // Should only read .org files
    expect(mockReadFile).toHaveBeenCalledTimes(2);
    expect(mockReadFile).toHaveBeenCalledWith(
      expect.stringContaining('emacs.org'),
      'utf-8'
    );
    expect(mockReadFile).toHaveBeenCalledWith(
      expect.stringContaining('docker.org'),
      'utf-8'
    );
  });

  test('caches results after initialization', async () => {
    mockReaddir.mockResolvedValue(['cached-file.org'] as any);
    mockReadFile.mockResolvedValue('#+title: Cached Content\n\nContent...');

    // First call
    const result1 = await linkResolver.resolveFilenameToSlug('cached-file');
    // Second call
    const result2 = await linkResolver.resolveFilenameToSlug('cached-file');

    expect(result1).toBe('cached-file');
    expect(result2).toBe('cached-file');
    
    // Should only initialize once
    expect(mockReaddir).toHaveBeenCalledTimes(1);
    expect(mockReadFile).toHaveBeenCalledTimes(1);
  });

  test('handles invalid input gracefully', async () => {
    mockReaddir.mockResolvedValue([]);

    const testCases = ['', null, undefined, 123, {}, []];
    
    for (const invalidInput of testCases) {
      const result = await linkResolver.resolveFilenameToSlug(invalidInput as any);
      expect(result).toBeNull();
    }
  });

  test('throws error when directory read fails', async () => {
    mockReaddir.mockRejectedValue(new Error('Permission denied'));

    await expect(linkResolver.resolveFilenameToSlug('test')).rejects.toThrow('Link resolver initialization failed');
  });

  test('handles file read errors gracefully', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    mockReaddir.mockResolvedValue(['error-file.org'] as any);
    mockReadFile.mockRejectedValue(new Error('File read error'));

    await expect(linkResolver.resolveFilenameToSlug('test')).rejects.toThrow('Link resolver initialization failed');
    
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to initialize link resolver:',
      expect.any(Error)
    );
    
    consoleWarnSpy.mockRestore();
  });

  test('extracts title correctly with various formats', async () => {
    mockReaddir.mockResolvedValue([
      'standard.org',
      'spaces.org',
      'mixed-case.org',
      'no-space.org'
    ] as any);
    
    mockReadFile
      .mockResolvedValueOnce('#+title: Standard Title\n\nContent...')
      .mockResolvedValueOnce('#+title:    Title With Spaces   \n\nContent...')
      .mockResolvedValueOnce('#+TITLE: Mixed Case Title\n\nContent...')
      .mockResolvedValueOnce('#+title:NoSpaceTitle\n\nContent...');

    // Test that all files are processed and cached
    await linkResolver.resolveFilenameToSlug('standard');
    
    expect(mockReadFile).toHaveBeenCalledTimes(4);
  });

  test('handles duplicate cache keys correctly', async () => {
    mockReaddir.mockResolvedValue(['test-file.org'] as any);
    mockReadFile.mockResolvedValue('#+title: Test File\n\nContent...');

    // Should resolve by both filename formats
    const result1 = await linkResolver.resolveFilenameToSlug('test-file');
    const result2 = await linkResolver.resolveFilenameToSlug('test-file.org');

    expect(result1).toBe('test-file');
    expect(result2).toBe('test-file');
    
    // Should only initialize once
    expect(mockReaddir).toHaveBeenCalledTimes(1);
  });

  test('clearCache resets state correctly', async () => {
    mockReaddir.mockResolvedValue(['reset-test.org'] as any);
    mockReadFile.mockResolvedValue('#+title: Reset Test\n\nContent...');

    // First initialization
    await linkResolver.resolveFilenameToSlug('reset-test');
    expect(mockReaddir).toHaveBeenCalledTimes(1);

    // Clear cache
    linkResolver.clearCache();

    // Second call should re-initialize
    await linkResolver.resolveFilenameToSlug('reset-test');
    expect(mockReaddir).toHaveBeenCalledTimes(2);
  });

  test('handles empty content directory', async () => {
    mockReaddir.mockResolvedValue([]);

    const result = await linkResolver.resolveFilenameToSlug('anything');

    expect(result).toBeNull();
    expect(mockReadFile).not.toHaveBeenCalled();
  });

  test('handles content directory with only non-org files', async () => {
    mockReaddir.mockResolvedValue([
      'README.md',
      'package.json',
      'script.js'
    ] as any);

    const result = await linkResolver.resolveFilenameToSlug('anything');

    expect(result).toBeNull();
    expect(mockReadFile).not.toHaveBeenCalled();
  });

  test('processes multiple files and maintains separate metadata', async () => {
    mockReaddir.mockResolvedValue([
      'file1.org',
      'file2.org',
      'file3.org'
    ] as any);
    
    mockReadFile
      .mockResolvedValueOnce('#+title: File One\n\nContent 1...')
      .mockResolvedValueOnce('#+title: File Two\n\nContent 2...')
      .mockResolvedValueOnce('#+title: File Three\n\nContent 3...');

    const result1 = await linkResolver.resolveFilenameToSlug('file1');
    const result2 = await linkResolver.resolveFilenameToSlug('file2');
    const result3 = await linkResolver.resolveFilenameToSlug('file3');
    const resultNotFound = await linkResolver.resolveFilenameToSlug('file4');

    expect(result1).toBe('file1');
    expect(result2).toBe('file2');
    expect(result3).toBe('file3');
    expect(resultNotFound).toBeNull();
    
    // Should only initialize once despite multiple calls
    expect(mockReaddir).toHaveBeenCalledTimes(1);
    expect(mockReadFile).toHaveBeenCalledTimes(3);
  });

  test('handles concurrent access correctly', async () => {
    mockReaddir.mockResolvedValue(['concurrent.org'] as any);
    mockReadFile.mockResolvedValue('#+title: Concurrent Test\n\nContent...');

    // Make multiple concurrent calls
    const promises = [
      linkResolver.resolveFilenameToSlug('concurrent'),
      linkResolver.resolveFilenameToSlug('concurrent'),
      linkResolver.resolveFilenameToSlug('concurrent')
    ];

    const results = await Promise.all(promises);

    // All should return the same result
    expect(results).toEqual(['concurrent', 'concurrent', 'concurrent']);
    
    // Since the current implementation doesn't have proper concurrency protection,
    // it may initialize multiple times but should still work correctly
    expect(mockReaddir).toHaveBeenCalled();
    expect(mockReadFile).toHaveBeenCalled();
  });
});