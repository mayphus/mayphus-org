import { visit } from 'unist-util-visit';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { Element } from 'hast';
import type { VFile } from 'vfile';

// Resolve Denote links to actual file paths (rehype plugin)
export const resolveIdLinks = () => {
  return async (tree: Element, _file: VFile) => {
    const idLinks: Element[] = [];
    
    // Find HTML anchor elements with href starting with "denote:"
    visit(tree, (node) => {
      if (node.type === 'element' && 
          node.tagName === 'a' && 
          node.properties?.href && 
          typeof node.properties.href === 'string' &&
          node.properties.href.startsWith('denote:')) {
        idLinks.push(node as Element);
      }
    });

    // Resolve each ID link
    for (const linkNode of idLinks) {
      const href = linkNode.properties?.href;
      if (typeof href === 'string') {
        const identifier = href.replace('denote:', '');
        const resolvedSlug = await resolveIdentifierToSlug(identifier);
        
        if (resolvedSlug && linkNode.properties) {
          // Convert to content route format
          linkNode.properties.href = `/content/${resolvedSlug}/`;
        }
      }
    }
  };
};

async function resolveIdentifierToSlug(identifier: string): Promise<string | null> {
  try {
    const contentDir = path.join(process.cwd(), 'content');
    const files = await fs.readdir(contentDir);
    
    for (const file of files) {
      if (file.endsWith('.org')) {
        const filePath = path.join(contentDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Check if this file has the matching identifier
        if (content.includes(`#+identifier: ${identifier}`)) {
          // Extract slug from filename (remove timestamp and extension)
          const fileName = path.basename(file, '.org');
          const slug = fileName.replace(/^\d{8}T\d{6}--/, '').split('__')[0];
          return slug;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.warn(`Failed to resolve identifier ${identifier}:`, error);
    return null;
  }
}