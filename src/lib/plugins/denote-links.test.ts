import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { Element } from 'hast';
import { resolveDenotLinks } from './denote-links.js';

// Mock the link resolver
vi.mock('../utils/link-resolver.js', () => ({
  linkResolver: {
    resolveIdentifierToSlug: vi.fn()
  }
}));

import { linkResolver } from '../utils/link-resolver.js';
const mockLinkResolver = vi.mocked(linkResolver);

describe('resolveDenotLinks', () => {
  let mockTree: Element;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('resolves denote: links to content URLs', async () => {
    // Create a mock tree with a denote link
    mockTree = {
      type: 'element',
      tagName: 'div',
      properties: {},
      children: [
        {
          type: 'element',
          tagName: 'a',
          properties: { href: 'denote:20240326T195811' },
          children: [{ type: 'text', value: 'LXD Guide' }]
        }
      ]
    };

    // Mock the resolver to return a slug
    mockLinkResolver.resolveIdentifierToSlug.mockResolvedValue('lxd');

    const plugin = resolveDenotLinks();
    await plugin(mockTree);

    const linkElement = mockTree.children[0] as Element;
    expect(linkElement.properties?.href).toBe('/content/lxd/');
    expect(mockLinkResolver.resolveIdentifierToSlug).toHaveBeenCalledWith('20240326T195811');
  });

  test('handles multiple denote links in same document', async () => {
    mockTree = {
      type: 'element',
      tagName: 'div',
      properties: {},
      children: [
        {
          type: 'element',
          tagName: 'a',
          properties: { href: 'denote:20240326T195811' },
          children: [{ type: 'text', value: 'LXD' }]
        },
        {
          type: 'element',
          tagName: 'a',
          properties: { href: 'denote:20240327T093642' },
          children: [{ type: 'text', value: 'Docker' }]
        }
      ]
    };

    mockLinkResolver.resolveIdentifierToSlug
      .mockResolvedValueOnce('lxd')
      .mockResolvedValueOnce('docker');

    const plugin = resolveDenotLinks();
    await plugin(mockTree);

    const link1 = mockTree.children[0] as Element;
    const link2 = mockTree.children[1] as Element;

    expect(link1.properties?.href).toBe('/content/lxd/');
    expect(link2.properties?.href).toBe('/content/docker/');
    expect(mockLinkResolver.resolveIdentifierToSlug).toHaveBeenCalledTimes(2);
  });

  test('leaves non-denote links unchanged', async () => {
    mockTree = {
      type: 'element',
      tagName: 'div',
      properties: {},
      children: [
        {
          type: 'element',
          tagName: 'a',
          properties: { href: 'https://example.com' },
          children: [{ type: 'text', value: 'External Link' }]
        },
        {
          type: 'element',
          tagName: 'a',
          properties: { href: '/internal/path' },
          children: [{ type: 'text', value: 'Internal Link' }]
        }
      ]
    };

    const plugin = resolveDenotLinks();
    await plugin(mockTree);

    const link1 = mockTree.children[0] as Element;
    const link2 = mockTree.children[1] as Element;

    expect(link1.properties?.href).toBe('https://example.com');
    expect(link2.properties?.href).toBe('/internal/path');
    expect(mockLinkResolver.resolveIdentifierToSlug).not.toHaveBeenCalled();
  });

  test('handles unresolvable denote links gracefully', async () => {
    mockTree = {
      type: 'element',
      tagName: 'div',
      properties: {},
      children: [
        {
          type: 'element',
          tagName: 'a',
          properties: { href: 'denote:99999999T999999' },
          children: [{ type: 'text', value: 'Broken Link' }]
        }
      ]
    };

    // Mock resolver to return null (not found)
    mockLinkResolver.resolveIdentifierToSlug.mockResolvedValue(null);

    const plugin = resolveDenotLinks();
    await plugin(mockTree);

    const linkElement = mockTree.children[0] as Element;
    // Should keep original href when resolution fails
    expect(linkElement.properties?.href).toBe('denote:99999999T999999');
  });

  test('handles nested denote links correctly', async () => {
    mockTree = {
      type: 'element',
      tagName: 'div',
      properties: {},
      children: [
        {
          type: 'element',
          tagName: 'section',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'p',
              properties: {},
              children: [
                {
                  type: 'element',
                  tagName: 'a',
                  properties: { href: 'denote:20240326T195811' },
                  children: [{ type: 'text', value: 'Nested Link' }]
                }
              ]
            }
          ]
        }
      ]
    };

    mockLinkResolver.resolveIdentifierToSlug.mockResolvedValue('nested-post');

    const plugin = resolveDenotLinks();
    await plugin(mockTree);

    const nestedLink = (mockTree.children[0] as Element).children[0] as Element;
    const linkElement = (nestedLink.children[0] as Element);
    
    expect(linkElement.properties?.href).toBe('/content/nested-post/');
  });

  test('handles plugin errors gracefully', async () => {
    mockTree = {
      type: 'element',
      tagName: 'div',
      properties: {},
      children: [
        {
          type: 'element',
          tagName: 'a',
          properties: { href: 'denote:20240326T195811' },
          children: [{ type: 'text', value: 'Test Link' }]
        }
      ]
    };

    // Mock resolver to throw error
    mockLinkResolver.resolveIdentifierToSlug.mockRejectedValue(new Error('Test error'));

    const plugin = resolveDenotLinks();
    
    // Should not throw, just continue gracefully
    await expect(plugin(mockTree)).resolves.not.toThrow();
    
    // Original link should remain unchanged
    const linkElement = mockTree.children[0] as Element;
    expect(linkElement.properties?.href).toBe('denote:20240326T195811');
  });
});