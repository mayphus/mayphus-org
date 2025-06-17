// Centralized configuration for the mayphus.org site
export const CONFIG = {
  // Content directory configuration
  CONTENT_DIR: 'content',
  
  // File patterns
  ORG_FILE_EXTENSION: '.org',
  DENOTE_FILENAME_PATTERN: /^(\d{8}T\d{6})--(.+?)(?:__(.+?))?\.org$/,
  IDENTIFIER_PATTERN: /#+identifier:\s*(.+)/i,
  
  // Cache configuration
  BACKLINKS_CACHE_TTL: 5 * 60 * 1000, // 5 minutes in milliseconds
  
  // Build configuration
  SUPPORTED_EXTENSIONS: ['.org'] as const,
  
  // Org-mode specific
  TODO_KEYWORDS: ['TODO', 'DONE', 'IN-PROGRESS', 'STARTED', 'WAITING', 'CANCELLED', 'CANCELED'],
  
  // Performance settings
  MAX_FILE_SIZE: 1024 * 1024, // 1MB max file size for processing
  
  // Error handling
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Type definitions for better type safety
export interface DenoteFileInfo {
  timestamp: string;
  title: string;
  tags?: string[];
  slug: string;
  identifier?: string;
}

export interface ProcessingError extends Error {
  code: string;
  file?: string;
  retryable: boolean;
}

// Utility functions
export function createProcessingError(
  message: string,
  code: string,
  file?: string,
  retryable = false
): ProcessingError {
  const error = new Error(message) as ProcessingError;
  error.code = code;
  error.file = file;
  error.retryable = retryable;
  return error;
}

export function parseDenoteFilename(filename: string): DenoteFileInfo | null {
  const match = filename.match(CONFIG.DENOTE_FILENAME_PATTERN);
  if (!match) return null;
  
  const [, timestamp, title, tagsStr] = match;
  const tags = tagsStr?.split('_').filter(Boolean);
  const slug = title.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  
  return {
    timestamp,
    title: title.replace(/-/g, ' '),
    tags,
    slug,
  };
}