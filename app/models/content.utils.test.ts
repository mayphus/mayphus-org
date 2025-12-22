import { describe, it, expect } from 'vitest';
import { parseDate, normalizePost } from './content.utils';

describe('content.utils', () => {
    describe('parseDate', () => {
        it('returns current ISO string if dateStr is undefined', () => {
            const result = parseDate(undefined);
            expect(typeof result).toBe('string');
            // Ensure it's a valid date
            expect(new Date(result).toString()).not.toBe('Invalid Date');
        });

        it('returns current ISO string if dateStr is null (cast via any)', () => {
            const result = parseDate(null as any);
            expect(typeof result).toBe('string');
            expect(new Date(result).toString()).not.toBe('Invalid Date');
        });

        it('parses Org mode timestamps with time successfully', () => {
            // Format: [YYYY-MM-DD Day HH:MM]
            const input = '[2024-01-22 Mon 11:45]';
            const expected = '2024-01-22T11:45:00';
            expect(parseDate(input)).toBe(expected);
        });

        it('parses Org mode timestamps without time successfully', () => {
            // Format: [YYYY-MM-DD Day]
            const input = '[2025-12-01 Sun]';
            const expected = '2025-12-01T00:00:00';
            expect(parseDate(input)).toBe(expected);
        });

        it('handles Org mode timestamps with various spacing', () => {
            const input = '[2024-05-10   Fri  ]';
            const expected = '2024-05-10T00:00:00';
            expect(parseDate(input)).toBe(expected);
        });

        it('returns the input cleaned if it does not match org pattern', () => {
            // If it's just a regular string date or not formatted as org timestamp
            const input = '2024-01-01';
            expect(parseDate(input)).toBe(input);
        });
    });

    describe('normalizePost', () => {
        // Mock component for testing
        const mockComponent = () => null;

        it('extracts slug from nested path correctly', () => {
            const path = '/content/blog/2024/my-post.org';
            const mod = { default: mockComponent, attributes: { title: 'Test' } };
            const post = normalizePost(path, mod);
            // Logic removes "/content/" and ".org"
            expect(post.slug).toBe('blog/2024/my-post');
        });

        it('extracts slug from simple path', () => {
            const path = '/content/hello.org';
            const mod = { default: mockComponent, attributes: { title: 'Hello' } };
            const post = normalizePost(path, mod);
            expect(post.slug).toBe('hello');
        });

        it('handles missing attributes gracefully', () => {
            const path = '/content/empty.org';
            // attributes might be missing if file is empty
            const mod = { default: mockComponent };
            const post = normalizePost(path, mod);

            expect(post.title).toBe('Untitled');
            expect(post.tags).toEqual([]);
            expect(post.description).toBeUndefined();
            // Code generates a date if missing
            expect(typeof post.date).toBe('string');
        });

        it('parses tags string with colons into array', () => {
            const path = '/content/tagged.org';
            const mod = {
                default: mockComponent,
                attributes: { filetags: ':tech:remix:' }
            };
            const post = normalizePost(path, mod);
            expect(post.tags).toEqual(['tech', 'remix']);
        });

        it('parses tags string with spaces into array', () => {
            const path = '/content/spaced-tags.org';
            const mod = {
                default: mockComponent,
                attributes: { filetags: 'react typescript' }
            };
            const post = normalizePost(path, mod);
            expect(post.tags).toEqual(['react', 'typescript']);
        });

        it('handles array of tags if provided directly (future proofing)', () => {
            const path = '/content/array-tags.org';
            const mod = {
                default: mockComponent,
                attributes: { filetags: ['one', 'two'] }
            };
            const post = normalizePost(path, mod);
            expect(post.tags).toEqual(['one', 'two']);
        });
    });
});
