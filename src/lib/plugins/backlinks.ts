import { readdir, readFile } from 'node:fs/promises';
import { join, basename } from 'node:path';

export interface BackLink {
  slug: string;
  title: string;
  identifier: string;
}

// Cache for performance
let backlinksIndex: Map<string, BackLink[]> | null = null;

// Rehype plugin to add backlinks to content
export const addBackLinks = () => {
  return async (tree: any, file: any) => {
    // Get current file's identifier from frontmatter
    const currentIdentifier = file.data?.astro?.frontmatter?.identifier;
    if (!currentIdentifier) return;
    
    // Get backlinks for this identifier
    const backlinks = await getBackLinksForIdentifier(currentIdentifier);
    if (backlinks.length === 0) return;
    
    // Create backlinks section HTML
    const backlinksSection = {
      type: 'element',
      tagName: 'section',
      properties: { className: ['backlinks'] },
      children: [
        {
          type: 'element',
          tagName: 'h2',
          properties: {},
          children: [{ type: 'text', value: 'Linked References' }]
        },
        {
          type: 'element',
          tagName: 'ul',
          properties: {},
          children: backlinks.map(backlink => ({
            type: 'element',
            tagName: 'li',
            properties: {},
            children: [{
              type: 'element',
              tagName: 'a',
              properties: { href: `/content/${backlink.slug}/` },
              children: [{ type: 'text', value: backlink.title || backlink.slug }]
            }]
          }))
        }
      ]
    };
    
    // Add backlinks section to the end of the document
    if (tree.type === 'root') {
      tree.children.push(backlinksSection);
    }
  };
};

async function getBackLinksForIdentifier(targetIdentifier: string): Promise<BackLink[]> {
  if (!backlinksIndex) {
    backlinksIndex = await buildBackLinksIndex();
  }
  
  return backlinksIndex.get(targetIdentifier) || [];
}

async function buildBackLinksIndex(): Promise<Map<string, BackLink[]>> {
  const index = new Map<string, BackLink[]>();
  
  try {
    const contentDir = join(process.cwd(), 'content');
    const files = await readdir(contentDir);
    
    // First pass: collect all files with their identifiers and metadata
    const fileMetadata = new Map<string, { slug: string; title: string; identifier: string }>();
    
    for (const file of files) {
      if (file.endsWith('.org')) {
        const filePath = join(contentDir, file);
        const content = await readFile(filePath, 'utf-8');
        
        // Extract identifier and title
        const identifierMatch = content.match(/^\s*#\+identifier:\s*(.+)$/m);
        const titleMatch = content.match(/^\s*#\+title:\s*(.+)$/m);
        
        if (identifierMatch) {
          const identifier = identifierMatch[1].trim();
          const title = titleMatch ? titleMatch[1].trim() : '';
          const fileName = basename(file, '.org');
          const slug = fileName.replace(/^\d{8}T\d{6}--/, '').split('__')[0];
          
          fileMetadata.set(identifier, { slug, title, identifier });
        }
      }
    }
    
    // Second pass: find all denote: links and build reverse index
    for (const file of files) {
      if (file.endsWith('.org')) {
        const filePath = join(contentDir, file);
        const content = await readFile(filePath, 'utf-8');
        
        // Extract this file's metadata
        const identifierMatch = content.match(/^\s*#\+identifier:\s*(.+)$/m);
        if (!identifierMatch) continue;
        
        const sourceIdentifier = identifierMatch[1].trim();
        const sourceMetadata = fileMetadata.get(sourceIdentifier);
        if (!sourceMetadata) continue;
        
        // Find all denote: links in this file
        const denoteLinks = content.match(/denote:(\d{8}T\d{6})/g) || [];
        
        for (const link of denoteLinks) {
          const targetIdentifier = link.replace('denote:', '');
          
          // Add this file as a backlink to the target
          if (!index.has(targetIdentifier)) {
            index.set(targetIdentifier, []);
          }
          
          const backlinks = index.get(targetIdentifier)!;
          // Avoid duplicates
          if (!backlinks.some(bl => bl.identifier === sourceIdentifier)) {
            backlinks.push({
              slug: sourceMetadata.slug,
              title: sourceMetadata.title,
              identifier: sourceIdentifier,
            });
          }
        }
      }
    }
    
    return index;
  } catch (error) {
    console.warn('Failed to build backlinks index:', error);
    return new Map();
  }
}

// Clear cache when needed (e.g., during development)
export function clearBackLinksCache() {
  backlinksIndex = null;
}