import { describe, test, expect, beforeEach } from 'vitest';
import type { VFile } from 'vfile';
import { processFrontmatter } from './frontmatter.js';

describe('processFrontmatter', () => {
  let mockFile: VFile;

  beforeEach(() => {
    mockFile = {
      data: {
        keywords: {}
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

  test('processes basic keywords into frontmatter', () => {
    mockFile.data.keywords = {
      title: 'My Test Post',
      identifier: '20240326T195811'
    };

    const processor = processFrontmatter();
    processor(null, mockFile);

    expect(mockFile.data.astro?.frontmatter?.title).toBe('My Test Post');
    expect(mockFile.data.astro?.frontmatter?.identifier).toBe('20240326T195811');
    expect(mockFile.data.astro?.frontmatter?.slug).toBe('test-file');
  });

  test('parses org-mode date format correctly', () => {
    mockFile.data.keywords = {
      date: '[2024-03-26 Tue 19:58]',
      title: 'Test Post'
    };

    const processor = processFrontmatter();
    processor(null, mockFile);

    const resultDate = mockFile.data.astro?.frontmatter?.date;
    expect(resultDate).toBeInstanceOf(Date);
    expect(resultDate.getFullYear()).toBe(2024);
    expect(resultDate.getMonth()).toBe(2); // March (0-indexed)
    expect(resultDate.getDate()).toBe(26);
    expect(resultDate.getHours()).toBe(19);
    expect(resultDate.getMinutes()).toBe(58);
  });

  test('normalizes filetags from string to array', () => {
    mockFile.data.keywords = {
      filetags: ':web:development:programming:',
      title: 'Test Post'
    };

    const processor = processFrontmatter();
    processor(null, mockFile);

    expect(mockFile.data.astro?.frontmatter?.filetags).toEqual(['web', 'development', 'programming']);
  });

  test('handles filetags already as array', () => {
    mockFile.data.keywords = {
      filetags: ['web', 'development'],
      title: 'Test Post'
    };

    const processor = processFrontmatter();
    processor(null, mockFile);

    expect(mockFile.data.astro?.frontmatter?.filetags).toEqual(['web', 'development']);
  });

  test('handles empty filetags', () => {
    mockFile.data.keywords = {
      filetags: '',
      title: 'Test Post'
    };

    const processor = processFrontmatter();
    processor(null, mockFile);

    expect(mockFile.data.astro?.frontmatter?.filetags).toEqual([]);
  });

  test('extracts slug from filename using utility', () => {
    mockFile.history = ['/path/to/lxd.org'];
    mockFile.data.keywords = {
      title: 'LXD Setup'
    };

    const processor = processFrontmatter();
    processor(null, mockFile);

    expect(mockFile.data.astro?.frontmatter?.slug).toBe('lxd');
  });

  test('creates astro frontmatter structure if not exists', () => {
    mockFile.data = { keywords: { title: 'Test' } };

    const processor = processFrontmatter();
    processor(null, mockFile);

    expect(mockFile.data.astro).toBeDefined();
    expect(mockFile.data.astro?.frontmatter).toBeDefined();
    expect(mockFile.data.astro?.frontmatter?.title).toBe('Test');
  });

  test('merges with existing frontmatter', () => {
    mockFile.data.astro = {
      frontmatter: {
        existingProperty: 'keep-this'
      }
    };
    mockFile.data.keywords = {
      title: 'New Title'
    };

    const processor = processFrontmatter();
    processor(null, mockFile);

    expect(mockFile.data.astro?.frontmatter?.existingProperty).toBe('keep-this');
    expect(mockFile.data.astro?.frontmatter?.title).toBe('New Title');
  });
});