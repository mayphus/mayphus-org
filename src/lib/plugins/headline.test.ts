// @ts-nocheck
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { customHeadline } from './headline.js';
import type { Node } from 'unist';

interface Headline extends Node {
  type: 'headline';
  level: number;
}

// Mock unist-util-visit
vi.mock('unist-util-visit', () => ({
  visit: vi.fn(),
}));

import { visit } from 'unist-util-visit';
const mockVisit = vi.mocked(visit);

describe('customHeadline plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('returns a function', () => {
    const plugin = customHeadline();
    expect(typeof plugin).toBe('function');
  });

  test('calls visit with correct parameters', () => {
    const plugin = customHeadline();
    const mockTree = { type: 'root', children: [] };

    plugin(mockTree);

    expect(mockVisit).toHaveBeenCalledWith(
      mockTree,
      'headline',
      expect.any(Function)
    );
  });

  describe('headline level transformation', () => {
    test('increments level 1 headline to level 2', () => {
      const plugin = customHeadline();
      let visitCallback: Function;

      // Capture the callback function passed to visit
      mockVisit.mockImplementation((_tree, _selector, callback) => {
        visitCallback = callback;
      });

      plugin({ type: 'root' });

      const headline = { type: 'headline', level: 1 };
      visitCallback(headline);

      expect(headline.level).toBe(2);
    });

    test('increments level 2 headline to level 3', () => {
      const plugin = customHeadline();
      let visitCallback: Function;

      mockVisit.mockImplementation((_tree, _selector, callback) => {
        visitCallback = callback;
      });

      plugin({ type: 'root' });

      const headline = { type: 'headline', level: 2 };
      visitCallback(headline);

      expect(headline.level).toBe(3);
    });

    test('increments level 3 headline to level 4', () => {
      const plugin = customHeadline();
      let visitCallback: Function;

      mockVisit.mockImplementation((_tree, _selector, callback) => {
        visitCallback = callback;
      });

      plugin({ type: 'root' });

      const headline = { type: 'headline', level: 3 };
      visitCallback(headline);

      expect(headline.level).toBe(4);
    });

    test('increments level 4 headline to level 5', () => {
      const plugin = customHeadline();
      let visitCallback: Function;

      mockVisit.mockImplementation((_tree, _selector, callback) => {
        visitCallback = callback;
      });

      plugin({ type: 'root' });

      const headline = { type: 'headline', level: 4 };
      visitCallback(headline);

      expect(headline.level).toBe(5);
    });

    test('increments level 5 headline to level 6', () => {
      const plugin = customHeadline();
      let visitCallback: Function;

      mockVisit.mockImplementation((_tree, _selector, callback) => {
        visitCallback = callback;
      });

      plugin({ type: 'root' });

      const headline = { type: 'headline', level: 5 };
      visitCallback(headline);

      expect(headline.level).toBe(6);
    });

    test('does not increment level 6 headlines beyond 6', () => {
      const plugin = customHeadline();
      let visitCallback: Function;

      mockVisit.mockImplementation((_tree, _selector, callback) => {
        visitCallback = callback;
      });

      plugin({ type: 'root' });

      const headline = { type: 'headline', level: 6 };
      visitCallback(headline);

      expect(headline.level).toBe(6);
    });
  });

  describe('edge cases and boundary conditions', () => {
    test('handles level 0 headline (edge case)', () => {
      const plugin = customHeadline();
      let visitCallback: Function;

      mockVisit.mockImplementation((_tree, _selector, callback) => {
        visitCallback = callback;
      });

      plugin({ type: 'root' });

      const headline = { type: 'headline', level: 0 };
      visitCallback(headline);

      expect(headline.level).toBe(1);
    });

    test('handles negative level headlines (edge case)', () => {
      const plugin = customHeadline();
      let visitCallback: Function;

      mockVisit.mockImplementation((_tree, _selector, callback) => {
        visitCallback = callback;
      });

      plugin({ type: 'root' });

      const headline = { type: 'headline', level: -1 };
      visitCallback(headline);

      expect(headline.level).toBe(0);
    });

    test('handles level 7+ headlines (above normal range)', () => {
      const plugin = customHeadline();
      let visitCallback: Function;

      mockVisit.mockImplementation((_tree, _selector, callback) => {
        visitCallback = callback;
      });

      plugin({ type: 'root' });

      const headline = { type: 'headline', level: 7 };
      visitCallback(headline);

      // Level 7 is not < 6, so it should remain unchanged
      expect(headline.level).toBe(7);
    });

    test('handles level 10 headlines (well above range)', () => {
      const plugin = customHeadline();
      let visitCallback: Function;

      mockVisit.mockImplementation((_tree, _selector, callback) => {
        visitCallback = callback;
      });

      plugin({ type: 'root' });

      const headline = { type: 'headline', level: 10 };
      visitCallback(headline);

      // Level 10 is not < 6, so it should remain unchanged
      expect(headline.level).toBe(10);
    });
  });

  describe('multiple headlines processing', () => {
    test('processes multiple headlines with different levels', () => {
      const plugin = customHeadline();
      const processedHeadlines: Headline[] = [];

      mockVisit.mockImplementation((_tree, _selector, callback) => {
        // Simulate processing multiple headlines
        [
          { type: 'headline', level: 1 },
          { type: 'headline', level: 2 },
          { type: 'headline', level: 3 },
          { type: 'headline', level: 5 },
          { type: 'headline', level: 6 },
        ].forEach(headline => {
          callback(headline);
          processedHeadlines.push({ ...headline });
        });
      });

      plugin({ type: 'root' });

      expect(processedHeadlines).toEqual([
        { type: 'headline', level: 2 }, // 1 -> 2
        { type: 'headline', level: 3 }, // 2 -> 3
        { type: 'headline', level: 4 }, // 3 -> 4
        { type: 'headline', level: 6 }, // 5 -> 6
        { type: 'headline', level: 6 }, // 6 -> 6 (no change)
      ]);
    });

    test('handles empty tree gracefully', () => {
      const plugin = customHeadline();

      mockVisit.mockImplementation(() => {
        // No headlines to process
      });

      // Should not throw
      expect(() => {
        plugin({ type: 'root', children: [] });
      }).not.toThrow();

      expect(mockVisit).toHaveBeenCalledWith(
        { type: 'root', children: [] },
        'headline',
        expect.any(Function)
      );
    });
  });

  describe('SEO and HTML standards compliance', () => {
    test('transforms org-mode h1 to html h2 for better SEO', () => {
      // This test verifies the SEO rationale mentioned in the comment
      const plugin = customHeadline();
      let visitCallback: Function;

      mockVisit.mockImplementation((_tree, _selector, callback) => {
        visitCallback = callback;
      });

      plugin({ type: 'root' });

      // Org-mode level 1 becomes HTML h2 (good for SEO when page has main h1)
      const orgLevel1 = { type: 'headline', level: 1 };
      visitCallback(orgLevel1);

      expect(orgLevel1.level).toBe(2);
    });

    test('ensures no headlines exceed h6 level', () => {
      const plugin = customHeadline();
      let visitCallback: Function;

      mockVisit.mockImplementation((_tree, _selector, callback) => {
        visitCallback = callback;
      });

      plugin({ type: 'root' });

      // Test boundary case - level 5 should become 6, not 7
      const maxLevel = { type: 'headline', level: 5 };
      visitCallback(maxLevel);

      expect(maxLevel.level).toBe(6);
      expect(maxLevel.level).toBeLessThanOrEqual(6);
    });

    test('creates progressive heading hierarchy', () => {
      const plugin = customHeadline();
      const headingLevels: number[] = [];

      mockVisit.mockImplementation((_tree, _selector, callback) => {
        // Simulate a document with progressive org-mode headings
        [1, 2, 3, 4, 5].forEach(level => {
          const headline = { type: 'headline', level };
          callback(headline);
          headingLevels.push(headline.level);
        });
      });

      plugin({ type: 'root' });

      // Should create h2, h3, h4, h5, h6 progression
      expect(headingLevels).toEqual([2, 3, 4, 5, 6]);
    });
  });

  describe('AST node handling', () => {
    test('only processes headline nodes', () => {
      const plugin = customHeadline();

      plugin({ type: 'root' });

      expect(mockVisit).toHaveBeenCalledWith(
        expect.any(Object),
        'headline', // Should specifically target headline nodes
        expect.any(Function)
      );
    });

    test('modifies headline nodes in place', () => {
      const plugin = customHeadline();
      let visitCallback: Function;

      mockVisit.mockImplementation((_tree, _selector, callback) => {
        visitCallback = callback;
      });

      plugin({ type: 'root' });

      const originalHeadline = { type: 'headline', level: 3, id: 'test-id' };
      const headlineRef = originalHeadline;

      visitCallback(originalHeadline);

      // Should modify the same object reference
      expect(originalHeadline).toBe(headlineRef);
      expect(originalHeadline.level).toBe(4);
      expect(originalHeadline.id).toBe('test-id'); // Other properties preserved
    });

    test('preserves other headline properties', () => {
      const plugin = customHeadline();
      let visitCallback: Function;

      mockVisit.mockImplementation((_tree, _selector, callback) => {
        visitCallback = callback;
      });

      plugin({ type: 'root' });

      const headline = {
        type: 'headline',
        level: 2,
        children: [{ type: 'text', value: 'Headline Text' }],
        data: { id: 'custom-id' },
        position: { start: { line: 1, column: 1 } },
      };

      visitCallback(headline);

      expect(headline.level).toBe(3); // Level changed
      expect(headline.type).toBe('headline'); // Type preserved
      expect(headline.children).toEqual([{ type: 'text', value: 'Headline Text' }]); // Children preserved
      expect(headline.data).toEqual({ id: 'custom-id' }); // Data preserved
      expect(headline.position).toEqual({ start: { line: 1, column: 1 } }); // Position preserved
    });
  });
});