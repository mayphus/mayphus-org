import { readdir, readFile } from 'node:fs/promises';
import * as path from 'node:path';
import { CONFIG, createProcessingError } from '../../config.js';
import { extractSlugFromFilename, extractIdentifierFromFilename } from './denote.js';

interface FileMetadata {
  slug: string;
  identifier: string | null;
  contentIdentifier: string | null;
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
          
          // Extract identifier from content (#+identifier: line)
          const identifierMatch = content.match(CONFIG.IDENTIFIER_PATTERN);
          const contentIdentifier = identifierMatch ? identifierMatch[1].trim() : null;
          
          // Extract identifier from filename
          const filenameIdentifier = extractIdentifierFromFilename(file);
          
          // Generate slug
          const slug = extractSlugFromFilename(file);

          const metadata: FileMetadata = {
            slug,
            identifier: filenameIdentifier,
            contentIdentifier,
          };

          // Cache by both filename and identifiers for fast lookup
          this.cache.set(file, metadata);
          if (contentIdentifier) {
            this.cache.set(contentIdentifier, metadata);
          }
          if (filenameIdentifier) {
            this.cache.set(filenameIdentifier, metadata);
          }
        }
      }

      this.initialized = true;
    } catch (error) {
      console.warn('Failed to initialize link resolver:', error);
      throw createProcessingError('Link resolver initialization failed', 'RESOLVER_INIT_FAILED');
    }
  }

  /**
   * Resolve a Denote identifier to its corresponding slug
   * @param identifier The Denote identifier to resolve
   * @returns The slug or null if not found
   */
  async resolveIdentifierToSlug(identifier: string): Promise<string | null> {
    if (!identifier || typeof identifier !== 'string') {
      return null;
    }

    await this.initialize();

    const metadata = this.cache.get(identifier);
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