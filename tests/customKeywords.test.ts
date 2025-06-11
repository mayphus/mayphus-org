import { test } from 'node:test';
import assert from 'node:assert/strict';
import { VFile } from 'vfile';
import { customKeywords } from '../src/lib/plugins/keyword.ts';

// helper to run plugin on a file
function runPlugin(file: VFile) {
  const plugin = customKeywords();
  plugin(null, file);
}

test('customKeywords parses date and filetags and generates slug', () => {
  const file = new VFile({
    path: '20240101T120000--my-title__tag1:tag2.org',
  });
  file.history = [file.path];
  file.data = {
    keywords: {
      date: '[2024-01-01 Mon 12:34]',
      filetags: 'tag1:tag2:'
    },
    astro: { frontmatter: {} }
  } as any;

  runPlugin(file);

  const frontmatter = (file.data as any).astro.frontmatter;
  assert.equal(frontmatter.slug, 'my-title');
  assert.deepEqual(frontmatter.filetags, ['tag1', 'tag2']);
  assert.ok(frontmatter.date instanceof Date);
  assert.equal(frontmatter.date.toISOString(), new Date('2024-01-01T12:34').toISOString());
});

test('existing frontmatter is preserved', () => {
  const file = new VFile({
    path: '20240101T123000--example__tag.org',
  });
  file.history = [file.path];
  file.data = {
    keywords: {
      filetags: 'tag:'
    },
    astro: { frontmatter: { author: 'Alice' } }
  } as any;

  runPlugin(file);

  const fm = (file.data as any).astro.frontmatter;
  assert.equal(fm.author, 'Alice');
  assert.equal(fm.slug, 'example');
  assert.deepEqual(fm.filetags, ['tag']);
});

test('missing keywords produces defaults', () => {
  const file = new VFile({ path: '20240101T120000--no-keywords.org' });
  file.history = [file.path];
  file.data = { astro: { frontmatter: {} } } as any;

  runPlugin(file);

  const fm = (file.data as any).astro.frontmatter;
  assert.equal(fm.slug, 'no-keywords');
  assert.deepEqual(fm.filetags, []);
  assert.equal(fm.date, undefined);
});
