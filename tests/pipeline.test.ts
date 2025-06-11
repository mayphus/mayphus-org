import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unified } from 'unified';
import uniorg from 'uniorg-parse';
import { extractKeywords } from 'uniorg-extract-keywords';
import { uniorgSlug } from 'uniorg-slug';
import { customKeywords } from '../src/lib/plugins/keyword';
import { customHeadline } from '../src/lib/plugins/headline';
import { VFile } from 'vfile';
import { visit } from 'unist-util-visit';

function initFrontmatter() {
  return function transformer(_tree: any, file: VFile) {
    if (!file.data.astro) {
      file.data.astro = { frontmatter: {} };
    }
  };
}

function keywordsToFrontmatter() {
  return function transformer(_tree: any, file: any) {
    file.data.astro.frontmatter = {
      ...file.data.astro.frontmatter,
      ...file.data.keywords,
    };
  };
}

test('org pipeline processes frontmatter and headings', async () => {
  const content = `#+title: Demo\n#+date: [2025-01-01 Wed 08:00]\n#+filetags: :demo:\n* First`;
  const file = new VFile({
    path: '20250101T080000--demo__demo.org',
    value: content,
  });
  file.history = [file.path];

  const processor = unified()
    .use(uniorg)
    .use(initFrontmatter)
    .use(extractKeywords, { name: 'keywords' })
    .use(keywordsToFrontmatter)
    .use(uniorgSlug)
    .use(customKeywords)
    .use(customHeadline);

  const tree = processor.parse(file);
  await processor.run(tree, file);

  const fm = (file.data as any).astro.frontmatter;
  assert.equal(fm.slug, 'demo');
  assert.deepEqual(fm.filetags, ['demo']);
  assert.ok(fm.date instanceof Date);

  const levels: number[] = [];
  visit(tree, 'headline', (node: any) => {
    levels.push(node.level);
  });
  assert.deepEqual(levels, [2]);
});
