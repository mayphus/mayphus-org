import { readdir, readFile, stat } from 'node:fs/promises';
import * as path from 'node:path';
import { CONFIG, createProcessingError } from '../../config.js';

interface FileMetadata {
  slug: string;
  title: string;
  relativePath: string;
}

/**
 * Cached file metadata to avoid re-reading files multiple times during build
 */
class LinkResolver {
  private cache = new Map<string, FileMetadata>();
  private initialized = false;

  private readonly orgExtension = CONFIG.ORG_FILE_EXTENSION;

  /**
   * Initialize the resolver by scanning all content files
   */
  private async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const contentDir = path.join(process.cwd(), CONFIG.CONTENT_DIR);
      await this.walkDirectory(contentDir, contentDir);

      this.initialized = true;
    } catch (error) {
      console.warn('Failed to initialize link resolver:', error);
      throw createProcessingError('Link resolver initialization failed', 'RESOLVER_INIT_FAILED');
    }
  }

  private async walkDirectory(rootDir: string, currentDir: string): Promise<void> {
    const entries = await readdir(currentDir);

    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry);
      const entryStat = await stat(entryPath);

      if (entryStat.isDirectory()) {
        await this.walkDirectory(rootDir, entryPath);
        continue;
      }

      if (!entry.endsWith(CONFIG.ORG_FILE_EXTENSION)) {
        continue;
      }

      const content = await readFile(entryPath, 'utf-8');

      // Extract title from content
      const titleMatch = content.match(/^\s*#\+title:\s*(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : '';

      const relativePathWithExt = path.relative(rootDir, entryPath).replace(/\\/g, '/');
      const relativePath = relativePathWithExt.endsWith(this.orgExtension)
        ? relativePathWithExt.slice(0, -this.orgExtension.length)
        : relativePathWithExt;
      const slug = path.posix.basename(relativePath);

      const metadata: FileMetadata = {
        slug,
        title,
        relativePath,
      };

      for (const key of this.generateCacheKeys(relativePath)) {
        this.cache.set(key, metadata);
      }
    }
  }

  private generateCacheKeys(relativePath: string): string[] {
    const normalized = relativePath.replace(/\\/g, '/');
    const keys = new Set<string>();

    const withExt = `${normalized}${this.orgExtension}`;
    const baseName = path.posix.basename(normalized);

    keys.add(normalized);
    keys.add(withExt);
    keys.add(baseName);
    keys.add(`${baseName}${this.orgExtension}`);

    return Array.from(keys);
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

    const lookupKeys = this.generateLookupKeys(filename);

    for (const key of lookupKeys) {
      const metadata = this.cache.get(key);
      if (metadata) {
        return metadata.slug;
      }
    }

    return null;
  }

  private generateLookupKeys(input: string): string[] {
    const sanitized = input.trim();
    if (!sanitized) {
      return [];
    }

    const cleaned = sanitized
      .replace(/^file:/, '')
      .replace(/^\.\//, '')
      .replace(/\\/g, '/');

    const normalized = cleaned.endsWith(this.orgExtension)
      ? cleaned.slice(0, -this.orgExtension.length)
      : cleaned;

    const keys = new Set<string>();
    keys.add(normalized);
    keys.add(`${normalized}${this.orgExtension}`);

    const baseName = path.posix.basename(normalized);
    keys.add(baseName);
    keys.add(`${baseName}${this.orgExtension}`);

    return Array.from(keys).filter(Boolean);
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
