import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { Element } from 'hast';
import { resolveOrgLinks } from './org-links.js';

// Mock the link resolver
vi.mock('../utils/link-resolver.js', () => ({
  linkResolver: {
    resolveFilenameToSlug: vi.fn()
  }
}));

import { linkResolver } from '../utils/link-resolver.js';

const mockLinkResolver = vi.mocked(linkResolver);

describe('resolveOrgLinks', () => {
  let mockTree: Element;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockTree = {
      type: 'root',
      children: []
    } as any;
  });

  test('resolves simple org-mode links', async () => {
    const linkElement: Element = {
      type: 'element',
      tagName: 'a',
      properties: { href: 'emacs' },
      children: [{ type: 'text', value: 'Emacs Config' }]
    };
    
    mockTree.children = [linkElement];
    mockLinkResolver.resolveFilenameToSlug.mockResolvedValue('emacs');

    const plugin = resolveOrgLinks();
    await plugin(mockTree);

    expect(mockLinkResolver.resolveFilenameToSlug).toHaveBeenCalledWith('emacs');
    expect(linkElement.properties?.href).toBe('/content/emacs/');
  });

  test('resolves file: links with .org extension', async () => {
    const linkElement: Element = {
      type: 'element',
      tagName: 'a',
      properties: { href: 'file:docker.org' },
      children: [{ type: 'text', value: 'Docker Notes' }]
    };
    
    mockTree.children = [linkElement];
    mockLinkResolver.resolveFilenameToSlug.mockResolvedValue('docker');

    const plugin = resolveOrgLinks();
    await plugin(mockTree);

    expect(mockLinkResolver.resolveFilenameToSlug).toHaveBeenCalledWith('docker');
    expect(linkElement.properties?.href).toBe('/content/docker/');
  });

  test('resolves file: links with relative paths', async () => {
    const linkElement: Element = {
      type: 'element',
      tagName: 'a',
      properties: { href: 'file:./linux.org' },
      children: [{ type: 'text', value: 'Linux Guide' }]
    };
    
    mockTree.children = [linkElement];
    mockLinkResolver.resolveFilenameToSlug.mockResolvedValue('linux');

    const plugin = resolveOrgLinks();
    await plugin(mockTree);

    expect(mockLinkResolver.resolveFilenameToSlug).toHaveBeenCalledWith('linux');
    expect(linkElement.properties?.href).toBe('/content/linux/');
  });

  test('ignores external HTTP links', async () => {
    const linkElement: Element = {
      type: 'element',
      tagName: 'a',
      properties: { href: 'https://example.com' },
      children: [{ type: 'text', value: 'External Link' }]
    };
    
    mockTree.children = [linkElement];

    const plugin = resolveOrgLinks();
    await plugin(mockTree);

    expect(mockLinkResolver.resolveFilenameToSlug).not.toHaveBeenCalled();
    expect(linkElement.properties?.href).toBe('https://example.com');
  });

  test('ignores anchor links', async () => {
    const linkElement: Element = {
      type: 'element',
      tagName: 'a',
      properties: { href: '#section' },
      children: [{ type: 'text', value: 'Section Link' }]
    };
    
    mockTree.children = [linkElement];

    const plugin = resolveOrgLinks();
    await plugin(mockTree);

    expect(mockLinkResolver.resolveFilenameToSlug).not.toHaveBeenCalled();
    expect(linkElement.properties?.href).toBe('#section');
  });

  test('ignores absolute paths', async () => {
    const linkElement: Element = {
      type: 'element',
      tagName: 'a',
      properties: { href: '/content/something/' },
      children: [{ type: 'text', value: 'Absolute Link' }]
    };
    
    mockTree.children = [linkElement];

    const plugin = resolveOrgLinks();
    await plugin(mockTree);

    expect(mockLinkResolver.resolveFilenameToSlug).not.toHaveBeenCalled();
    expect(linkElement.properties?.href).toBe('/content/something/');
  });

  test('ignores JavaScript files', async () => {
    const linkElement: Element = {
      type: 'element',
      tagName: 'a',
      properties: { href: 'script.js' },
      children: [{ type: 'text', value: 'Script' }]
    };
    
    mockTree.children = [linkElement];

    const plugin = resolveOrgLinks();
    await plugin(mockTree);

    expect(mockLinkResolver.resolveFilenameToSlug).not.toHaveBeenCalled();
    expect(linkElement.properties?.href).toBe('script.js');
  });

  test('warns when link cannot be resolved', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const linkElement: Element = {
      type: 'element',
      tagName: 'a',
      properties: { href: 'nonexistent' },
      children: [{ type: 'text', value: 'Broken Link' }]
    };
    
    mockTree.children = [linkElement];
    mockLinkResolver.resolveFilenameToSlug.mockResolvedValue(null);

    const plugin = resolveOrgLinks();
    await plugin(mockTree);

    expect(consoleWarnSpy).toHaveBeenCalledWith('Could not resolve org-mode link: nonexistent');
    expect(linkElement.properties?.href).toBe('nonexistent'); // Unchanged
    
    consoleWarnSpy.mockRestore();
  });

  test('handles multiple links in same tree', async () => {
    const link1: Element = {
      type: 'element',
      tagName: 'a',
      properties: { href: 'emacs' },
      children: [{ type: 'text', value: 'Emacs' }]
    };
    
    const link2: Element = {
      type: 'element',
      tagName: 'a',
      properties: { href: 'file:docker.org' },
      children: [{ type: 'text', value: 'Docker' }]
    };
    
    mockTree.children = [
      { type: 'element', tagName: 'p', properties: {}, children: [link1] },
      { type: 'element', tagName: 'p', properties: {}, children: [link2] }
    ];
    
    mockLinkResolver.resolveFilenameToSlug
      .mockResolvedValueOnce('emacs')
      .mockResolvedValueOnce('docker');

    const plugin = resolveOrgLinks();
    await plugin(mockTree);

    expect(mockLinkResolver.resolveFilenameToSlug).toHaveBeenCalledTimes(2);
    expect(link1.properties?.href).toBe('/content/emacs/');
    expect(link2.properties?.href).toBe('/content/docker/');
  });

  test('handles resolver errors gracefully', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const linkElement: Element = {
      type: 'element',
      tagName: 'a',
      properties: { href: 'emacs' },
      children: [{ type: 'text', value: 'Emacs' }]
    };
    
    mockTree.children = [linkElement];
    mockLinkResolver.resolveFilenameToSlug.mockRejectedValue(new Error('Resolver error'));

    const plugin = resolveOrgLinks();
    await plugin(mockTree);

    expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to resolve org-mode links:', expect.any(Error));
    expect(linkElement.properties?.href).toBe('emacs'); // Unchanged
    
    consoleWarnSpy.mockRestore();
  });

  test('processes nested link elements correctly', async () => {
    const linkElement: Element = {
      type: 'element',
      tagName: 'a',
      properties: { href: 'nested-content' },
      children: [{ type: 'text', value: 'Nested' }]
    };
    
    const nestedStructure: Element = {
      type: 'element',
      tagName: 'div',
      properties: {},
      children: [
        {
          type: 'element',
          tagName: 'section',
          properties: {},
          children: [linkElement]
        }
      ]
    };
    
    mockTree.children = [nestedStructure];
    mockLinkResolver.resolveFilenameToSlug.mockResolvedValue('nested-content');

    const plugin = resolveOrgLinks();
    await plugin(mockTree);

    expect(mockLinkResolver.resolveFilenameToSlug).toHaveBeenCalledWith('nested-content');
    expect(linkElement.properties?.href).toBe('/content/nested-content/');
  });
});