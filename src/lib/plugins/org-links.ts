import { visit } from 'unist-util-visit';
import type { Element } from 'hast';
import { linkResolver } from '../utils/link-resolver.js';

/**
 * Rehype plugin to resolve org-mode links from [[link]] format to "/content/slug/" URLs
 * 
 * Transforms: <a href="emacs">Emacs</a> or <a href="./emacs.org">Emacs</a>
 * Into: <a href="/content/emacs/">Emacs</a>
 */
export const resolveOrgLinks = () => {
  return async (tree: Element) => {
    try {
      const orgLinks: Element[] = [];
      
      // Find HTML anchor elements with href that could be org-mode links
      visit(tree, (node) => {
        if (isOrgLinkElement(node)) {
          orgLinks.push(node as Element);
        }
      });

      // Resolve each org-mode link
      await resolveLinks(orgLinks);
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
async function resolveLinks(linkNodes: Element[]): Promise<void> {
  for (const linkNode of linkNodes) {
    const href = linkNode.properties?.href;
    
    if (typeof href === 'string' && linkNode.properties) {
      // Clean up the href - remove file: prefix, .org extension, and leading ./
      const cleanHref = href
        .replace(/^file:/, '')
        .replace(/^\.\//, '')
        .replace(/\.org$/, '');
      
      const resolvedSlug = await linkResolver.resolveFilenameToSlug(cleanHref);
      
      if (resolvedSlug) {
        // Convert to content route format
        linkNode.properties.href = `/content/${resolvedSlug}/`;
      } else {
        console.warn(`Could not resolve org-mode link: ${href}`);
      }
    }
  }
}