import { visit } from 'unist-util-visit';
import type { Element } from 'hast';
import type { VFile } from 'vfile';
import * as path from 'node:path';
import { linkResolver } from '../utils/link-resolver.js';
import { CONFIG } from '../../config.js';

/**
 * Rehype plugin to resolve org-mode links from [[link]] format to "/content/slug/" URLs
 * 
 * Transforms: <a href="emacs">Emacs</a> or <a href="./emacs.org">Emacs</a>
 * Into: <a href="/content/emacs/">Emacs</a>
 */
export const resolveOrgLinks = () => {
  return async (tree: Element, file?: VFile) => {
    try {
      const orgLinks: Element[] = [];
      
      // Find HTML anchor elements with href that could be org-mode links
      visit(tree, (node) => {
        if (isOrgLinkElement(node)) {
          orgLinks.push(node as Element);
        }
      });

      // Resolve each org-mode link
      await resolveLinks(orgLinks, file?.path);
    } catch (error) {
      console.warn('Failed to resolve org-mode links:', error);
      // Continue without resolving links rather than failing the build
    }
  };
};

/**
 * Type guard to check if a node is an org-mode link element
 */
function isOrgLinkElement(node: any): node is Element {
  if (node.type !== 'element' || node.tagName !== 'a' || !node.properties?.href) {
    return false;
  }
  
  const href = node.properties.href;
  if (typeof href !== 'string') {
    return false;
  }
  
  // Check if it's a local link (not starting with http/https/mailto/etc)
  // Include file: links as they're standard org-mode format
  const isExternalProtocol = href.match(/^(https?|mailto|tel|ftp):/i);
  const isInternalAnchor = href.startsWith('#');
  const isAbsolutePath = href.startsWith('/');
  const isNodeModules = href.includes('node_modules');
  const isJSFile = href.match(/\.(js|mjs|ts)$/);
  
  // Process if it's a file: link to .org files OR a simple local reference
  const isFileLink = href.startsWith('file:') && href.endsWith('.org');
  const isSimpleLocal = !isExternalProtocol && !isInternalAnchor && !isAbsolutePath && !isNodeModules && !isJSFile;
  
  return isFileLink || isSimpleLocal;
}

/**
 * Resolve an array of org-mode link elements
 */
async function resolveLinks(linkNodes: Element[], currentFilePath?: string): Promise<void> {
  for (const linkNode of linkNodes) {
    const href = linkNode.properties?.href;
    
    if (typeof href === 'string' && linkNode.properties) {
      const normalizedTarget = normalizeOrgLinkTarget(href, currentFilePath);
      if (!normalizedTarget) {
        continue;
      }

      const resolvedSlug = await linkResolver.resolveFilenameToSlug(normalizedTarget);
      
      if (resolvedSlug) {
        // Convert to content route format
        linkNode.properties.href = `/content/${resolvedSlug}/`;
      } else {
        console.warn(`Could not resolve org-mode link: ${href}`);
      }
    }
  }
}

function normalizeOrgLinkTarget(href: string, currentFilePath?: string): string | null {
  const contentRoot = path.join(process.cwd(), CONFIG.CONTENT_DIR);
  const cleaned = href.replace(/^file:/, '').replace(/\\/g, '/');

  if (!cleaned) {
    return null;
  }

  const baseDir = currentFilePath ? path.dirname(currentFilePath) : contentRoot;
  const hasExtension = cleaned.endsWith(CONFIG.ORG_FILE_EXTENSION);
  const candidateWithExt = hasExtension ? cleaned : `${cleaned}${CONFIG.ORG_FILE_EXTENSION}`;

  const candidatePath = path.resolve(baseDir, candidateWithExt);
  const normalizedCandidate = candidatePath.replace(/\\/g, '/');

  if (!normalizedCandidate.startsWith(contentRoot.replace(/\\/g, '/'))) {
    // Fallback to slug-style lookup when the link points outside content root
    const fallback = hasExtension ? cleaned.slice(0, -CONFIG.ORG_FILE_EXTENSION.length) : cleaned;
    return fallback.replace(/^\.\//, '').replace(/\/+/g, '/');
  }

  const relativePathWithExt = path.relative(contentRoot, candidatePath).replace(/\\/g, '/');
  const withoutExt = relativePathWithExt.endsWith(CONFIG.ORG_FILE_EXTENSION)
    ? relativePathWithExt.slice(0, -CONFIG.ORG_FILE_EXTENSION.length)
    : relativePathWithExt;

  return withoutExt.replace(/^\.\//, '');
}
