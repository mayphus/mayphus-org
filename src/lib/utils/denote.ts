import { CONFIG } from '../../config.js';

/**
 * Denote filename structure utilities
 * Handles the standard Denote format: YYYYMMDDTHHMMSS--title__tags.org
 */

export interface DenoteMetadata {
  identifier: string;
  title: string;
  slug: string;
  tags: string[];
  originalFilename: string;
}

/**
 * Extract slug from Denote filename using consistent logic
 * @param filename The filename (with or without .org extension)
 * @returns Clean slug for URL generation
 */
export function extractSlugFromFilename(filename: string): string {
  // Remove .org extension if present
  const baseFilename = filename.replace(/\.org$/, '');
  
  // Remove timestamp prefix (YYYYMMDDTHHMMSS--)
  const withoutTimestamp = baseFilename.replace(/^\d{8}T\d{6}--/, '');
  
  // Extract title part (everything before __ tags)
  const slug = withoutTimestamp.split('__')[0].toLowerCase();
  
  return slug;
}

/**
 * Parse a complete Denote filename into its components
 * @param filename The filename to parse
 * @returns Parsed metadata or null if not a valid Denote filename
 */
export function parseDenoteFilename(filename: string): DenoteMetadata | null {
  const match = filename.match(CONFIG.DENOTE_FILENAME_PATTERN);
  if (!match) return null;

  const [, identifier, title, tagsStr] = match;
  const tags = tagsStr ? tagsStr.split('_').filter(Boolean) : [];
  const slug = extractSlugFromFilename(filename);

  return {
    identifier,
    title: title.replace(/-/g, ' '),
    slug,
    tags,
    originalFilename: filename,
  };
}

/**
 * Check if a filename follows Denote convention
 * @param filename The filename to check
 * @returns true if it's a valid Denote filename
 */
export function isDenoteFilename(filename: string): boolean {
  return CONFIG.DENOTE_FILENAME_PATTERN.test(filename);
}

/**
 * Extract identifier from Denote filename
 * @param filename The filename to extract from
 * @returns The identifier (timestamp) or null if not found
 */
export function extractIdentifierFromFilename(filename: string): string | null {
  const match = filename.match(/^(\d{8}T\d{6})/);
  return match ? match[1] : null;
}