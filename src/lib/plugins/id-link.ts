import { visit } from 'unist-util-visit';
import fs from 'node:fs/promises';
import path from 'node:path';
import type { Element } from 'hast';
import type { VFile } from 'vfile';
import { CONFIG, createProcessingError } from '../../config.js';

// Resolve Denote links to actual file paths (rehype plugin)
export const resolveIdLinks = () => {
  return async (tree: Element, _file: VFile) => {
    try {
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
    } catch (error) {
      console.warn('Failed to resolve ID links:', error);
      // Continue without resolving links rather than failing the build
    }
  };
};

async function resolveIdentifierToSlug(identifier: string): Promise<string | null> {
  if (!identifier || typeof identifier !== 'string') {
    throw createProcessingError('Invalid identifier provided', 'INVALID_IDENTIFIER');
  }
  
  try {
    const contentDir = path.join(process.cwd(), CONFIG.CONTENT_DIR);
    const files = await fs.readdir(contentDir);
    
    for (const file of files) {
      if (file.endsWith(CONFIG.ORG_FILE_EXTENSION)) {
        const filePath = path.join(contentDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Check if this file has the matching identifier
        const identifierMatch = content.match(CONFIG.IDENTIFIER_PATTERN);
        if (identifierMatch && identifierMatch[1].trim() === identifier) {
          // Extract slug from filename using centralized pattern
          const fileName = path.basename(file, CONFIG.ORG_FILE_EXTENSION);
          const match = fileName.match(CONFIG.DENOTE_FILENAME_PATTERN);
          const slug = match ? match[2] : fileName;
          return slug;
        }
      }
    }
    
    return null;
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      console.warn(`Failed to resolve identifier ${identifier} (${error.code}):`, error.message);
    } else {
      console.warn(`Failed to resolve identifier ${identifier}:`, error);
    }
    return null;
  }
}