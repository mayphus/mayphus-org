import { readdir, readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { CONFIG } from '../../config.js';

export interface BackLink {
  slug: string;
  title: string;
  filename: string;
}

// In-memory cache for the current build process
let backlinksCache: Map<string, BackLink[]> | null = null;

const CACHE_DIR = join(process.cwd(), '.astro');
const CACHE_FILE = join(CACHE_DIR, 'backlinks.json');

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
  if (!backlinksCache) {
    try {
      backlinksCache = await buildBackLinksIndex();
    } catch (error) {
      console.warn('Failed to build backlinks index:', error);
      backlinksCache = new Map(); // Ensure cache is not null
    }
  }
  
  return backlinksCache.get(targetFilename) || [];
}

async function isCacheStale(contentFiles: string[], contentDir: string): Promise<boolean> {
  try {
    const cacheStat = await stat(CACHE_FILE);
    for (const file of contentFiles) {
      const fileStat = await stat(join(contentDir, file));
      if (fileStat.mtime > cacheStat.mtime) {
        return true; // A content file is newer than the cache
      }
    }
    return false; // Cache is fresh
  } catch (error) {
    // If cache file doesn't exist or other error, it's stale
    return true;
  }
}

async function buildBackLinksIndex(): Promise<Map<string, BackLink[]>> {
  const contentDir = join(process.cwd(), CONFIG.CONTENT_DIR);
  const files = await readdir(contentDir);
  const orgFiles = files.filter(file => file.endsWith(CONFIG.ORG_FILE_EXTENSION));

  if (!await isCacheStale(orgFiles, contentDir)) {
    try {
      const cachedData = await readFile(CACHE_FILE, 'utf-8');
      // JSON can't store a Map, so we store as an array and convert back
      return new Map(JSON.parse(cachedData));
    } catch (error) {
      console.warn('Failed to read backlinks cache, rebuilding...', error);
    }
  }

  // --- Cache is stale or missing, rebuild ---
  const index = new Map<string, BackLink[]>();
  
  try {
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
    
    // Write the new index to the cache file
    try {
      await mkdir(CACHE_DIR, { recursive: true });
      // Convert Map to array for JSON serialization
      await writeFile(CACHE_FILE, JSON.stringify(Array.from(index.entries())));
    } catch (error) {
      console.warn('Failed to write backlinks cache:', error);
    }

    return index;
  } catch (error) {
    console.error('FATAL: Failed to build backlinks index:', error);
    // Return an empty map on fatal error to avoid crashing the build
    return new Map();
  }
}

// Clear cache when needed (e.g., during development)
export function clearBackLinksCache() {
  backlinksCache = null;
  // Also remove the persistent cache file (async but don't wait)
  if (typeof writeFile === 'function') {
    try {
      const result = writeFile(CACHE_FILE, '{}');
      if (result && typeof result.catch === 'function') {
        result.catch(err => console.warn('Could not clear persistent cache', err));
      }
    } catch (err) {
      console.warn('Could not clear persistent cache', err);
    }
  }
}

// Get cache status for debugging
export async function getBackLinksCacheInfo() {
  const inMemoryExists = !!backlinksCache;
  
  try {
    const cacheStat = await stat(CACHE_FILE);
    return {
      inMemoryExists,
      persistent: {
        exists: true,
        size: cacheStat.size,
        modified: cacheStat.mtime,
      }
    };
  } catch {
    return {
      inMemoryExists,
      persistent: {
        exists: false,
      }
    };
  }
}