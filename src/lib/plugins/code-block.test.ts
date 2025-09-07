import { describe, it, expect } from 'vitest';
import type { Element } from 'hast';
import { codeBlock } from './code-block';

describe('codeBlock', () => {
  it('replaces pre > code with CodeBlock component', () => {
    const tree: any = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'pre',
          properties: {},
          children: [
            {
              type: 'element',
              tagName: 'code',
              properties: { className: ['language-js'] },
              children: [{ type: 'text', value: 'console.log(1);' }],
            },
          ],
        },
      ],
    };

    const plugin = codeBlock();
    plugin(tree);

    const node = tree.children[0] as Element;
    expect(node.tagName).toBe('CodeBlock');
    expect(node.properties?.code).toBe('console.log(1);');
    expect(node.properties?.language).toBe('js');
  });
});
