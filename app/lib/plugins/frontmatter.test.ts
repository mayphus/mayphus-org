import { describe, it, expect } from 'vitest';
import { initFrontmatter, keywordsToFrontmatter } from './frontmatter';
import { VFile } from 'vfile';

describe('frontmatter plugins', () => {
    describe('initFrontmatter', () => {
        it('initializes frontmatter and attributes objects', () => {
            const file = new VFile();
            const transformer = initFrontmatter();
            transformer(null, file);

            expect(file.data.frontmatter).toEqual({});
            expect(file.data.attributes).toEqual({});
        });
    });

    describe('keywordsToFrontmatter', () => {
        it('maps keywords to frontmatter and attributes', () => {
            const file = new VFile();
            file.data.keywords = {
                TITLE: 'Hello World',
                DATE: '2024-01-01',
                FILETAGS: ':test:tag:',
            };

            const transformer = keywordsToFrontmatter();
            transformer(null, file);

            const data = file.data as any;
            expect(data.frontmatter.title).toBe('Hello World');
            expect(data.frontmatter.date).toBe('2024-01-01');
            expect(data.frontmatter.filetags).toEqual(['test', 'tag']);
            expect(data.attributes.title).toBe('Hello World');
        });

        it('handles space-separated tags', () => {
            const file = new VFile();
            file.data.keywords = {
                FILETAGS: 'tag1 tag2',
            };

            const transformer = keywordsToFrontmatter();
            transformer(null, file);

            expect((file.data as any).frontmatter.filetags).toEqual(['tag1', 'tag2']);
        });

        it('preserves existing frontmatter', () => {
            const file = new VFile();
            file.data.frontmatter = { existing: 'value' };
            file.data.keywords = { TITLE: 'New Title' };

            const transformer = keywordsToFrontmatter();
            transformer(null, file);

            expect((file.data as any).frontmatter.existing).toBe('value');
            expect((file.data as any).frontmatter.title).toBe('New Title');
        });
    });
});
