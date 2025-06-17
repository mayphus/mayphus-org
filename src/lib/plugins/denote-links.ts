import { visit } from 'unist-util-visit';
import type { Element } from 'hast';
import type { VFile } from 'vfile';
import { linkResolver } from '../utils/link-resolver.js';

/**
 * Rehype plugin to resolve Denote links from "denote:XXXXXX" format to "/content/slug/" URLs
 * 
 * Transforms: <a href="denote:20240919T215155">Arduino</a>
 * Into: <a href="/content/arduino/">Arduino</a>
 */
export const resolveDenotLinks = () => {
  return async (tree: Element, _file: VFile) => {
    try {
      const idLinks: Element[] = [];
      
      // Find HTML anchor elements with href starting with "denote:"
      visit(tree, (node) => {
        if (isDenoteLinkElement(node)) {
          idLinks.push(node as Element);
        }
      });

      // Resolve each Denote link
      await resolveLinks(idLinks);
    } catch (error) {
      console.warn('Failed to resolve Denote links:', error);
      // Continue without resolving links rather than failing the build
    }
  };
};

/**
 * Type guard to check if a node is a Denote link element
 */
function isDenoteLinkElement(node: any): node is Element {
  return (
    node.type === 'element' && 
    node.tagName === 'a' && 
    node.properties?.href && 
    typeof node.properties.href === 'string' &&
    node.properties.href.startsWith('denote:')
  );
}

/**
 * Resolve an array of Denote link elements
 */
async function resolveLinks(linkNodes: Element[]): Promise<void> {
  for (const linkNode of linkNodes) {
    const href = linkNode.properties?.href;
    
    if (typeof href === 'string' && linkNode.properties) {
      const identifier = href.replace('denote:', '');
      const resolvedSlug = await linkResolver.resolveIdentifierToSlug(identifier);
      
      if (resolvedSlug) {
        // Convert to content route format
        linkNode.properties.href = `/content/${resolvedSlug}/`;
      } else {
        console.warn(`Could not resolve Denote identifier: ${identifier}`);
      }
    }
  }
}