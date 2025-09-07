import { visit } from 'unist-util-visit';
import type { Element, Root, Text } from 'hast';

export const codeBlock = () => {
  return (tree: Root) => {
    visit(tree, 'element', (node, index, parent) => {
      if (
        node.tagName === 'pre' &&
        node.children.length === 1 &&
        node.children[0].type === 'element' &&
        (node.children[0] as Element).tagName === 'code'
      ) {
        const codeEl = node.children[0] as Element;
        const textNode = codeEl.children[0] as Text | undefined;
        const text = textNode?.value ?? '';
        const className = codeEl.properties?.className as string[] | undefined;
        const lang = className?.find(c => c.startsWith('language-'))?.replace('language-', '');

        const newNode: Element = {
          type: 'element',
          tagName: 'CodeBlock',
          properties: {
            code: text,
            language: lang,
          },
          children: [],
        };

        if (parent && typeof index === 'number') {
          (parent as Element).children[index] = newNode;
        }
      }
    });
  };
};
