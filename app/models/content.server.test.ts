import { describe, it, expect, vi } from 'vitest';
import * as contentServer from './content.server';

// Mock content.utils to isolate server logic
vi.mock('./content.utils', () => ({
  normalizePost: vi.fn((path, mod) => {
    // Return a simplified post object based on input
    return {
      slug: path.replace('/content/', '').replace('.org', ''),
      title: mod.attributes?.title || 'Untitled',
      date: mod.attributes?.date || '2024-01-01T00:00:00',
      tags: [],
      Component: mod.default,
    };
  }),
}));

describe('content.server', () => {
  it('exports expected functions', () => {
    expect(typeof contentServer.getPosts).toBe('function');
    expect(typeof contentServer.getPost).toBe('function');
    expect(typeof contentServer.transformModulesToPosts).toBe('function');
  });

  describe('transformModulesToPosts', () => {
    it('transforms and sorts modules by date descending', () => {
      const mockModules = {
        '/content/old.org': {
          attributes: { title: 'Old Post', date: '2023-01-01' },
          default: () => null,
        },
        '/content/new.org': {
          attributes: { title: 'New Post', date: '2024-01-01' },
          default: () => null,
        },
        '/content/middle.org': {
          attributes: { title: 'Middle Post', date: '2023-06-01' },
          default: () => null,
        },
      };

      const posts = contentServer.transformModulesToPosts(mockModules);

      expect(posts).toHaveLength(3);
      expect(posts[0].title).toBe('New Post');
      expect(posts[1].title).toBe('Middle Post');
      expect(posts[2].title).toBe('Old Post');
    });

    it('handles missing dates by putting them at the end', () => {
      const mockModules = {
        '/content/no-date.org': {
          attributes: { title: 'No Date' },
          default: () => null,
        },
        '/content/with-date.org': {
          attributes: { title: 'With Date', date: '2024-01-01' },
          default: () => null,
        },
      };

      const posts = contentServer.transformModulesToPosts(mockModules);
      expect(posts[0].title).toBe('With Date');
      expect(posts[1].title).toBe('No Date');
    });
  });

  describe('getPost', () => {
    it('returns a post if it exists', () => {
      // We know at least one post exists in the project
      const posts = contentServer.getPosts();
      if (posts.length > 0) {
        const slug = posts[0].slug;
        const post = contentServer.getPost(slug);
        expect(post).not.toBeNull();
        expect(post?.slug).toBe(slug);
      }
    });

    it('returns null if no post matches slug', () => {
      const post = contentServer.getPost('non-existent-slug-12345');
      expect(post).toBeNull();
    });
  });

  describe('getPosts', () => {
    it('returns an array of posts', () => {
      const posts = contentServer.getPosts();
      expect(Array.isArray(posts)).toBe(true);
      // Ensure they are sorted by date
      for (let i = 1; i < posts.length; i++) {
        const timeA = new Date(posts[i - 1].date).getTime() || 0;
        const timeB = new Date(posts[i].date).getTime() || 0;
        expect(timeA).toBeGreaterThanOrEqual(timeB);
      }
    });
  });
});

