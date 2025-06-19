import { readdir, readFile } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { CONFIG } from '../../config.js';

export interface BackLink {
  slug: string;
  title: string;
  identifier: string;
}

// Cache for performance with TTL
interface CacheEntry {
  data: Map<string, BackLink[]>;
  timestamp: number;
}

let backlinksCache: CacheEntry | null = null;

// Rehype plugin to add backlinks to content
export const addBackLinks = () => {
  return async (tree: any, file: any) => {
    try {
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
    } catch (error) {
      console.warn('Failed to add backlinks:', error);
      // Continue without backlinks rather than failing the build
    }
  };
};

async function getBackLinksForIdentifier(targetIdentifier: string): Promise<BackLink[]> {
  const now = Date.now();
  
  // Force rebuild cache during build (disable cache for now)  
  if (!backlinksCache || (now - backlinksCache.timestamp) > CONFIG.BACKLINKS_CACHE_TTL) {
    try {
      const index = await buildBackLinksIndex();
      backlinksCache = {
        data: index,
        timestamp: now,
      };
    } catch (error) {
      console.warn('Failed to build backlinks index:', error);
      return [];
    }
  }
  
  return backlinksCache.data.get(targetIdentifier) || [];
}

async function buildBackLinksIndex(): Promise<Map<string, BackLink[]>> {
  const index = new Map<string, BackLink[]>();
  
  try {
    const contentDir = join(process.cwd(), CONFIG.CONTENT_DIR);
    const files = await readdir(contentDir);
    const orgFiles = files.filter(file => file.endsWith(CONFIG.ORG_FILE_EXTENSION));
    
    // Read all files in parallel
    const fileContents = await Promise.all(
      orgFiles.map(async (file) => {
        const filePath = join(contentDir, file);
        const content = await readFile(filePath, 'utf-8');
        return { file, content };
      })
    );
    
    // First pass: collect all files with their identifiers and metadata
    const fileMetadata = new Map<string, { slug: string; title: string; identifier: string }>();
    
    for (const { file, content } of fileContents) {
      // Extract identifier and title
      const identifierMatch = content.match(CONFIG.IDENTIFIER_PATTERN);
      const titleMatch = content.match(/^\s*#\+title:\s*(.+)$/m);
      
      if (identifierMatch) {
        const identifier = identifierMatch[1].trim();
        const title = titleMatch ? titleMatch[1].trim() : '';
        const fileName = basename(file, CONFIG.ORG_FILE_EXTENSION);
        const match = fileName.match(CONFIG.DENOTE_FILENAME_PATTERN);
        const slug = match ? match[2] : fileName;
        
        fileMetadata.set(identifier, { slug, title, identifier });
      }
    }
    
    // Second pass: find all denote: links and build reverse index
    for (const { content } of fileContents) {
      // Extract this file's metadata
      const identifierMatch = content.match(CONFIG.IDENTIFIER_PATTERN);
      if (!identifierMatch) continue;
      
      const sourceIdentifier = identifierMatch[1].trim();
      const sourceMetadata = fileMetadata.get(sourceIdentifier);
      if (!sourceMetadata) continue;
      
      // Find all denote: links in this file (both bare and org-mode link formats)
      const denoteLinks = content.match(/(?:\[\[)?denote:(\d{8}T\d{6})/g) || [];
      
      for (const link of denoteLinks) {
        const targetIdentifier = link.replace(/(?:\[\[)?denote:/, '');
        
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
    
    return index;
  } catch (error) {
    console.warn('Failed to build backlinks index:', error);
    return new Map();
  }
}

// Clear cache when needed (e.g., during development)
export function clearBackLinksCache() {
  backlinksCache = null;
}

// Get cache status for debugging
export function getBackLinksCacheInfo() {
  if (!backlinksCache) return { exists: false };
  
  const now = Date.now();
  const age = now - backlinksCache.timestamp;
  const expired = age > CONFIG.BACKLINKS_CACHE_TTL;
  
  return {
    exists: true,
    age,
    expired,
    entries: backlinksCache.data.size,
  };
}