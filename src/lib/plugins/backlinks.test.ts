import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { Element } from 'hast';
import type { VFile } from 'vfile';
import { addBackLinks, clearBackLinksCache } from './backlinks.js';

// Mock file system operations
vi.mock('node:fs/promises', () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
  stat: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
}));

import { readdir, readFile, stat, writeFile, mkdir } from 'node:fs/promises';

const mockReaddir = vi.mocked(readdir);
const mockReadFile = vi.mocked(readFile);
const mockStat = vi.mocked(stat);
const mockWriteFile = vi.mocked(writeFile);
const mockMkdir = vi.mocked(mkdir);

describe('addBackLinks', () => {
  let mockTree: Element;
  let mockFile: VFile;

  beforeEach(() => {
    vi.clearAllMocks();
    clearBackLinksCache(); // Clear cache between tests
    
    // Setup default mocks for caching functionality
    mockStat.mockRejectedValue(new Error('Cache file not found')); // Cache doesn't exist by default
    mockWriteFile.mockResolvedValue(undefined);
    mockMkdir.mockResolvedValue(undefined);
    
    mockTree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [{ type: 'text', value: 'Existing content' }]
        }
      ]
    } as any;

    mockFile = {
      data: {
        astro: {
          frontmatter: {}
        }
      },
      history: ['test-file.org'],
      cwd: process.cwd(),
      messages: [],
      value: '',
      map: undefined,
      stem: 'test-file',
      extname: '.org',
      dirname: '',
      basename: 'test-file.org',
      path: '/path/to/test-file.org',
      result: undefined,
      stored: false,
      fail: () => {},
      info: () => {},
      message: () => {}
    } as unknown as VFile;
  });

  test('adds backlinks section when backlinks exist', async () => {
    // Mock file system responses
    mockReaddir.mockResolvedValue(['docker.org', 'kubernetes.org'] as any);
    
    mockReadFile
      .mockResolvedValueOnce(`#+title: Docker\n\nSee [[test-file]] for more info.`)
      .mockResolvedValueOnce(`#+title: Kubernetes\n\nCheck out [[test-file][Test File]] for details.`);

    const plugin = addBackLinks();
    await plugin(mockTree, mockFile);

    // Should add backlinks section to the tree
    expect(mockTree.children).toHaveLength(2); // Original content + backlinks section
    
    const backlinksSection = mockTree.children[1] as Element;
    expect(backlinksSection.tagName).toBe('section');
    expect(backlinksSection.properties?.className).toEqual(['backlinks']);
    
    // Check h2 heading
    const heading = backlinksSection.children?.[0] as Element;
    expect(heading.tagName).toBe('h2');
    expect((heading.children?.[0] as any)?.value).toBe('Linked References');
    
    // Check ul list
    const list = backlinksSection.children?.[1] as Element;  
    expect(list.tagName).toBe('ul');
    expect(list.children).toHaveLength(2); // Two backlinks
  });

  test('does not add backlinks section when no backlinks exist', async () => {
    mockReaddir.mockResolvedValue(['unrelated.org'] as any);
    mockReadFile.mockResolvedValue(`#+title: Unrelated Post\n\nNo links here.`);

    const plugin = addBackLinks();
    await plugin(mockTree, mockFile);

    // Should not add backlinks section
    expect(mockTree.children).toHaveLength(1); // Only original content
  });

  test('does not process files without valid path', async () => {
    mockFile.path = ''; // No valid path

    const plugin = addBackLinks();
    await plugin(mockTree, mockFile);

    // Should not call file system operations
    expect(mockReaddir).not.toHaveBeenCalled();
    expect(mockReadFile).not.toHaveBeenCalled();
  });

  test('generates correct backlink URLs', async () => {
    mockReaddir.mockResolvedValue(['linking-post.org'] as any);
    mockReadFile.mockResolvedValue(`#+title: Linking Post\n\nSee [[test-file][target]].`);

    const plugin = addBackLinks();
    await plugin(mockTree, mockFile);

    const backlinksSection = mockTree.children[1] as Element;
    const list = backlinksSection.children?.[1] as Element;
    const listItem = list.children?.[0] as Element;
    const link = listItem.children?.[0] as Element;

    expect(link.tagName).toBe('a');
    expect(link.properties?.href).toBe('/content/linking-post/');
    expect((link.children?.[0] as any)?.value).toBe('Linking Post');
  });

  test('handles different org-mode link formats', async () => {
    mockReaddir.mockResolvedValue(['post1.org', 'post2.org'] as any);
    
    // Test both [[test-file]] and [[./test-file.org]] formats
    mockReadFile
      .mockResolvedValueOnce(`#+title: Post 1\n\nReference: [[test-file]]`)
      .mockResolvedValueOnce(`#+title: Post 2\n\nSee [[./test-file.org][Test File]]`);

    const plugin = addBackLinks();
    await plugin(mockTree, mockFile);

    const backlinksSection = mockTree.children[1] as Element;
    const list = backlinksSection.children?.[1] as Element;
    
    expect(list.children).toHaveLength(2);
  });

  test('caches backlinks index to persistent storage', async () => {
    mockReaddir.mockResolvedValue(['docker.org'] as any);
    mockReadFile.mockResolvedValue(`#+title: Docker\n\nSee [[test-file]] for more info.`);

    const plugin = addBackLinks();
    await plugin(mockTree, mockFile);

    // Should attempt to create cache directory and write cache file
    expect(mockMkdir).toHaveBeenCalledWith(expect.stringContaining('.astro'), { recursive: true });
    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('backlinks.json'),
      expect.any(String)
    );
  });

  test('uses cached data when cache is fresh', async () => {
    const cacheData = JSON.stringify([
      ['test-file', [{ slug: 'cached-post', title: 'Cached Post', filename: 'cached-post' }]]
    ]);
    
    // Mock cache file exists and is fresh
    mockStat.mockResolvedValue({ 
      mtime: new Date('2024-01-02'), 
      size: 100 
    } as any);
    
    // Mock content directory check - cache is newer than content
    mockReaddir.mockResolvedValue(['test-file.org'] as any);
    mockStat
      .mockResolvedValueOnce({ mtime: new Date('2024-01-02'), size: 100 } as any) // Cache file
      .mockResolvedValueOnce({ mtime: new Date('2024-01-01'), size: 50 } as any); // Content file is older
    
    mockReadFile.mockResolvedValue(cacheData);

    const plugin = addBackLinks();
    await plugin(mockTree, mockFile);

    // Should use cached data without rebuilding
    expect(mockReadFile).toHaveBeenCalledWith(
      expect.stringContaining('backlinks.json'),
      'utf-8'
    );
    
    // Should add backlinks from cache
    expect(mockTree.children).toHaveLength(2);
    const backlinksSection = mockTree.children[1] as Element;
    const list = backlinksSection.children?.[1] as Element;
    const listItem = list.children?.[0] as Element;
    const link = listItem.children?.[0] as Element;
    
    expect(link.properties?.href).toBe('/content/cached-post/');
    expect((link.children?.[0] as any)?.value).toBe('Cached Post');
  });

  test('rebuilds cache when content files are newer', async () => {
    // Mock cache file exists but is stale
    mockStat
      .mockResolvedValueOnce({ mtime: new Date('2024-01-01'), size: 100 } as any) // Cache file is older
      .mockResolvedValueOnce({ mtime: new Date('2024-01-02'), size: 50 } as any); // Content file is newer
    
    mockReaddir.mockResolvedValue(['docker.org'] as any);
    mockReadFile.mockResolvedValue(`#+title: Docker\n\nSee [[test-file]] for more info.`);

    const plugin = addBackLinks();
    await plugin(mockTree, mockFile);

    // Should rebuild cache despite cache file existing
    expect(mockWriteFile).toHaveBeenCalledWith(
      expect.stringContaining('backlinks.json'),
      expect.any(String)
    );
  });

  test('handles cache read errors gracefully', async () => {
    // Mock cache file exists but cache read fails
    mockStat.mockResolvedValue({ mtime: new Date('2024-01-01'), size: 100 } as any);
    mockReaddir.mockResolvedValue(['docker.org'] as any);
    mockReadFile
      .mockRejectedValueOnce(new Error('Cache read failed')) // Cache file read fails
      .mockResolvedValueOnce(`#+title: Docker\n\nSee [[test-file]] for more info.`); // Content read succeeds

    const plugin = addBackLinks();
    await plugin(mockTree, mockFile);

    // Should still process backlinks despite cache read failure by rebuilding from content
    expect(mockTree.children).toHaveLength(2);
    expect(mockWriteFile).toHaveBeenCalled(); // Should write new cache
  });
});