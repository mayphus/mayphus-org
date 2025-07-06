import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { Element } from 'hast';
import type { VFile } from 'vfile';
import { addBackLinks, clearBackLinksCache } from './backlinks.js';

// Mock file system operations
vi.mock('node:fs/promises', () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}));

import { readdir, readFile } from 'node:fs/promises';

const mockReaddir = vi.mocked(readdir);
const mockReadFile = vi.mocked(readFile);

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
});