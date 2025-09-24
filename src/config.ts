import { SITE_CONFIG } from './lib/site';

// Centralized configuration for the multi-site project
export const CONFIG = {
  // Content directory configuration
  CONTENT_DIR: SITE_CONFIG.contentDir,
  
  // File patterns
  ORG_FILE_EXTENSION: '.org',
  
  // Org-mode link patterns
  ORG_LINK_PATTERN: /\[\[([^\]]+)\](?:\[([^\]]+)\])?\]/g,
  FILE_LINK_PATTERN: /\[\[(?:file:)?\.?\/?([\w-]+(?:\.org)?)\](?:\[([^\]]+)\])?\]/g,
  
  // Cache configuration
  BACKLINKS_CACHE_TTL: 30 * 60 * 1000, // 30 minutes in milliseconds
  
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
