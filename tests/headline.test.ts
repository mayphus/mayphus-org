import { test } from 'node:test';
import assert from 'node:assert/strict';
import { customHeadline } from '../src/lib/plugins/headline.ts';

function runPlugin(tree: any) {
  const plugin = customHeadline();
  plugin(tree);
}

test('headline levels increment but not above six', () => {
  const tree = {
    type: 'root',
    children: [
      { type: 'headline', level: 1 },
      { type: 'headline', level: 5 },
      { type: 'headline', level: 6 }
    ]
  };

  runPlugin(tree);

  const levels = tree.children.map((n: any) => n.level);
  assert.deepEqual(levels, [2, 6, 6]);
});
