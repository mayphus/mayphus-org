import fs from 'node:fs/promises';
import path from 'node:path';
import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

interface Options {
  contentDir?: string;
}

export const denoteLink: Plugin<[Options?]> = (opts: Options = {}) => {
  const contentDir = opts.contentDir ?? path.join(process.cwd(), 'content');
  let idMap: Map<string, string> | null = null;

  async function init() {
    if (idMap) return;
    idMap = new Map();
    try {
      const files = await fs.readdir(contentDir);
      for (const file of files) {
        const match = file.match(/^(\d{8}T\d{6})--(.+?)(?:__.*)?\.org$/);
        if (match) {
          const [, id, slugPart] = match;
          idMap.set(id, slugPart.toLowerCase());
        }
      }
    } catch {
      // ignore if content directory is missing
      idMap = new Map();
    }
  }

  return async (tree: any) => {
    await init();
    visit(tree, 'link', (node: any) => {
      if (node.linkType === 'id' && idMap) {
        const slug = idMap.get(node.path);
        if (slug) {
          node.linkType = 'file';
          node.path = `/content/${slug}/`;
          node.rawLink = node.path;
        }
      }
    });
  };
};

export default denoteLink;
