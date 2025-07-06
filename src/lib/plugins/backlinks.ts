import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { CONFIG } from '../../config.js';

export interface BackLink {
  slug: string;
  title: string;
  filename: string;
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
      // Get current file's slug from file path
      const filePath = file.path;
      if (!filePath) return;
      
      const filename = filePath.split('/').pop()?.replace('.org', '') || '';
      if (!filename) return;
      
      // Get backlinks for this filename
      const backlinks = await getBackLinksForFilename(filename);
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

async function getBackLinksForFilename(targetFilename: string): Promise<BackLink[]> {
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
  
  return backlinksCache.data.get(targetFilename) || [];
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
    
    // First pass: collect all files with their metadata
    const fileMetadata = new Map<string, { slug: string; title: string; filename: string }>();
    
    for (const { file, content } of fileContents) {
      // Extract title
      const titleMatch = content.match(/^\s*#\+title:\s*(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : '';
      const slug = file.replace('.org', '');
      const filename = file.replace('.org', '');
      
      fileMetadata.set(filename, { slug, title, filename });
    }
    
    // Second pass: find all org-mode links and build reverse index
    for (const { file, content } of fileContents) {
      const sourceFilename = file.replace('.org', '');
      const sourceMetadata = fileMetadata.get(sourceFilename);
      if (!sourceMetadata) continue;
      
      // Find all org-mode links in this file
      const orgLinks = Array.from(content.matchAll(CONFIG.ORG_LINK_PATTERN));
      const fileLinks = Array.from(content.matchAll(CONFIG.FILE_LINK_PATTERN));
      
      // Process both types of links
      const allLinks = [...orgLinks, ...fileLinks];
      
      for (const match of allLinks) {
        const linkTarget = match[1];
        if (!linkTarget) continue;
        
        // Clean up the link target
        const targetFilename = linkTarget
          .replace(/^file:/, '')
          .replace(/^\.\//, '')
          .replace(/\.org$/, '');
        
        // Skip external links
        if (targetFilename.includes('://') || targetFilename.startsWith('#')) {
          continue;
        }
        
        // Add this file as a backlink to the target
        if (!index.has(targetFilename)) {
          index.set(targetFilename, []);
        }
        
        const backlinks = index.get(targetFilename)!;
        // Avoid duplicates
        if (!backlinks.some(bl => bl.filename === sourceFilename)) {
          backlinks.push({
            slug: sourceMetadata.slug,
            title: sourceMetadata.title,
            filename: sourceFilename,
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