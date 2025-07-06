import { readdir, readFile } from 'node:fs/promises';
import * as path from 'node:path';
import { CONFIG, createProcessingError } from '../../config.js';

interface FileMetadata {
  slug: string;
  title: string;
  filename: string;
}

/**
 * Cached file metadata to avoid re-reading files multiple times during build
 */
class LinkResolver {
  private cache = new Map<string, FileMetadata>();
  private initialized = false;

  /**
   * Initialize the resolver by scanning all content files
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const contentDir = path.join(process.cwd(), CONFIG.CONTENT_DIR);
      const files = await readdir(contentDir);

      for (const file of files) {
        if (file.endsWith(CONFIG.ORG_FILE_EXTENSION)) {
          const filePath = path.join(contentDir, file);
          const content = await readFile(filePath, 'utf-8');
          
          // Extract title from content
          const titleMatch = content.match(/^\s*#\+title:\s*(.+)$/m);
          const title = titleMatch ? titleMatch[1].trim() : '';
          
          // Generate slug and filename
          const slug = file.replace('.org', '');
          const filename = file.replace('.org', '');

          const metadata: FileMetadata = {
            slug,
            title,
            filename,
          };

          // Cache by filename for fast lookup
          this.cache.set(filename, metadata);
          this.cache.set(file, metadata);
        }
      }

      this.initialized = true;
    } catch (error) {
      console.warn('Failed to initialize link resolver:', error);
      throw createProcessingError('Link resolver initialization failed', 'RESOLVER_INIT_FAILED');
    }
  }

  /**
   * Resolve a filename to its corresponding slug
   * @param filename The filename to resolve (without .org extension)
   * @returns The slug or null if not found
   */
  async resolveFilenameToSlug(filename: string): Promise<string | null> {
    if (!filename || typeof filename !== 'string') {
      return null;
    }

    await this.initialize();

    const metadata = this.cache.get(filename);
    return metadata?.slug || null;
  }

  /**
   * Clear the cache (useful for testing or hot reloading)
   */
  clearCache(): void {
    this.cache.clear();
    this.initialized = false;
  }
}

// Export a singleton instance
export const linkResolver = new LinkResolver();