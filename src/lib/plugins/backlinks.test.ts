import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { Element } from 'hast';
import type { VFile } from 'vfile';
import { addBackLinks, clearBackLinksCache } from './backlinks.js';

// Mock file system operations
vi.mock('node:fs/promises', () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}));

// Mock the denote utility
vi.mock('../utils/denote.js', () => ({
  extractSlugFromFilename: vi.fn()
}));

import { readdir, readFile } from 'node:fs/promises';
import { extractSlugFromFilename } from '../utils/denote.js';

const mockReaddir = vi.mocked(readdir);
const mockReadFile = vi.mocked(readFile);
const mockExtractSlug = vi.mocked(extractSlugFromFilename);

describe('addBackLinks', () => {
  let mockTree: Element;
  let mockFile: VFile;

  beforeEach(() => {
    vi.clearAllMocks();
    clearBackLinksCache(); // Clear cache between tests
    
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
          frontmatter: {
            identifier: '20240326T195811'
          }
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
      path: 'test-file.org',
      result: undefined,
      stored: false,
      fail: () => {},
      info: () => {},
      message: () => {}
    } as unknown as VFile;
  });

  test('adds backlinks section when backlinks exist', async () => {
    // Mock file system responses
    mockReaddir.mockResolvedValue(['post1.org', 'post2.org'] as any);
    
    mockReadFile
      .mockResolvedValueOnce(`#+identifier: 20240327T093642\n#+title: Docker\n\nSee [[denote:20240326T195811][LXD]] for containers.`)
      .mockResolvedValueOnce(`#+identifier: 20240328T101347\n#+title: Kubernetes\n\nUse denote:20240326T195811 for setup.`);

    mockExtractSlug
      .mockReturnValueOnce('docker')
      .mockReturnValueOnce('kubernetes');

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
    mockReaddir.mockResolvedValue(['post1.org'] as any);
    mockReadFile.mockResolvedValue(`#+identifier: 20240327T093642\n#+title: Unrelated Post\n\nNo links here.`);
    mockExtractSlug.mockReturnValue('unrelated');

    const plugin = addBackLinks();
    await plugin(mockTree, mockFile);

    // Should not add backlinks section
    expect(mockTree.children).toHaveLength(1); // Only original content
  });

  test('does not process files without identifier', async () => {
    mockFile.data = {}; // No frontmatter with identifier

    const plugin = addBackLinks();
    await plugin(mockTree, mockFile);

    // Should not call file system operations
    expect(mockReaddir).not.toHaveBeenCalled();
    expect(mockReadFile).not.toHaveBeenCalled();
  });

  test('generates correct backlink URLs', async () => {
    mockReaddir.mockResolvedValue(['linking-post.org'] as any);
    mockReadFile.mockResolvedValue(`#+identifier: 20240327T093642\n#+title: Linking Post\n\nSee [[denote:20240326T195811][target]].`);
    mockExtractSlug.mockReturnValue('linking-post');

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

  test('handles different denote link formats', async () => {
    mockReaddir.mockResolvedValue(['post1.org', 'post2.org'] as any);
    
    // Test both [[denote:ID]] and bare denote:ID formats
    mockReadFile
      .mockResolvedValueOnce(`#+identifier: 20240327T093642\n#+title: Post 1\n\nSee [[denote:20240326T195811][link]].`)
      .mockResolvedValueOnce(`#+identifier: 20240328T101347\n#+title: Post 2\n\nReference denote:20240326T195811 here.`);

    mockExtractSlug
      .mockReturnValueOnce('post-1')
      .mockReturnValueOnce('post-2');

    const plugin = addBackLinks();
    await plugin(mockTree, mockFile);

    const backlinksSection = mockTree.children[1] as Element;
    const list = backlinksSection.children?.[1] as Element;
    
    expect(list.children).toHaveLength(2); // Both formats detected
  });

  test('avoids duplicate backlinks from same file', async () => {
    mockReaddir.mockResolvedValue(['post1.org'] as any);
    
    // File with multiple references to same target
    mockReadFile.mockResolvedValue(`#+identifier: 20240327T093642\n#+title: Multi Reference\n\nFirst [[denote:20240326T195811][ref]] and second denote:20240326T195811 reference.`);
    mockExtractSlug.mockReturnValue('multi-reference');

    const plugin = addBackLinks();
    await plugin(mockTree, mockFile);

    const backlinksSection = mockTree.children[1] as Element;
    const list = backlinksSection.children?.[1] as Element;
    
    expect(list.children).toHaveLength(1); // Only one backlink despite multiple references
  });

  test('handles file system errors gracefully', async () => {
    mockReaddir.mockRejectedValue(new Error('File system error'));

    const plugin = addBackLinks();
    
    // Should not throw error
    await expect(plugin(mockTree, mockFile)).resolves.not.toThrow();
    
    // Should not add backlinks section
    expect(mockTree.children).toHaveLength(1);
  });

  test('filters files by .org extension', async () => {
    mockReaddir.mockResolvedValue(['post1.org', 'image.png', 'post2.org', 'README.md'] as any);
    
    mockReadFile
      .mockResolvedValueOnce(`#+identifier: 20240327T093642\n#+title: Post 1\n\nLink [[denote:20240326T195811][here]].`)
      .mockResolvedValueOnce(`#+identifier: 20240328T101347\n#+title: Post 2\n\nAnother denote:20240326T195811 link.`);

    mockExtractSlug
      .mockReturnValueOnce('post-1')
      .mockReturnValueOnce('post-2');

    const plugin = addBackLinks();
    await plugin(mockTree, mockFile);

    // Should only read .org files
    expect(mockReadFile).toHaveBeenCalledTimes(2);
    
    const backlinksSection = mockTree.children[1] as Element;
    const list = backlinksSection.children?.[1] as Element;
    expect(list.children).toHaveLength(2);
  });
});