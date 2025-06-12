import { visit } from 'unist-util-visit';
import fs from 'node:fs/promises';
import path from 'node:path';

// Resolve Denote links to actual file paths (rehype plugin)
export const resolveIdLinks = () => {
  return async (tree: any, _file: any) => {
    const idLinks: any[] = [];
    
    // Find HTML anchor elements with href starting with "denote:"
    visit(tree, (node: any) => {
      if (node.type === 'element' && 
          node.tagName === 'a' && 
          node.properties?.href && 
          node.properties.href.startsWith('denote:')) {
        idLinks.push(node);
      }
    });

    // Resolve each ID link
    for (const linkNode of idLinks) {
      const identifier = linkNode.properties.href.replace('denote:', '');
      const resolvedSlug = await resolveIdentifierToSlug(identifier);
      
      if (resolvedSlug) {
        // Convert to content route format
        linkNode.properties.href = `/content/${resolvedSlug}/`;
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