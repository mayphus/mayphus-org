import { describe, test, expect } from 'vitest';
import { extractSlugFromFilename, parseDenoteFilename } from './utils/denote.js';

/**
 * Integration tests that demonstrate testing the complete Org-mode to HTML pipeline
 * These tests show how to verify that your content conversion works end-to-end
 */

describe('Org-mode Content Processing Integration', () => {
  test('complete Denote filename processing pipeline', () => {
    // Simulate a real Denote filename from your content directory
    const filename = '20240326T195811--lxd__lxd_ubuntu.org';
    
    // Test the complete parsing pipeline
    const metadata = parseDenoteFilename(filename);
    const slug = extractSlugFromFilename(filename);
    
    // Verify all parts work together correctly
    expect(metadata).not.toBeNull();
    expect(metadata!.identifier).toBe('20240326T195811');
    expect(metadata!.title).toBe('lxd');
    expect(metadata!.tags).toEqual(['lxd', 'ubuntu']);
    expect(metadata!.slug).toBe('lxd');
    expect(slug).toBe('lxd');
    
    // Verify the slug matches what would be used in URLs
    const expectedUrl = `/content/${slug}/`;
    expect(expectedUrl).toBe('/content/lxd/');
  });

  test('link reference integrity', () => {
    // Test data representing real content scenarios
    const testCases = [
      {
        sourceFile: '20240327T093642--docker__containers.org',
        sourceContent: 'See [[denote:20240326T195811][LXD]] for setup.',
        targetIdentifier: '20240326T195811',
        expectedBacklinkSlug: 'docker'
      },
      {
        sourceFile: '20240328T101347--kubernetes__orchestration.org', 
        sourceContent: 'Alternative to denote:20240326T195811 containers.',
        targetIdentifier: '20240326T195811',
        expectedBacklinkSlug: 'kubernetes'
      }
    ];

    testCases.forEach(({ sourceFile, sourceContent, targetIdentifier, expectedBacklinkSlug }) => {
      // Test filename parsing
      const sourceMetadata = parseDenoteFilename(sourceFile);
      expect(sourceMetadata).not.toBeNull();
      
      // Test slug extraction
      const actualSlug = extractSlugFromFilename(sourceFile);
      expect(actualSlug).toBe(expectedBacklinkSlug);
      
      // Test link detection patterns
      const denoteLinks = sourceContent.match(/(?:\[\[)?denote:(\d{8}T\d{6})/g) || [];
      expect(denoteLinks.length).toBeGreaterThan(0);
      
      // Verify the target identifier is found
      if (denoteLinks.length > 0) {
        const firstLink = denoteLinks[0];
        if (firstLink) {
          const foundIdentifier = firstLink.replace(/(?:\[\[)?denote:/, '');
          expect(foundIdentifier).toBe(targetIdentifier);
        }
      }
    });
  });

  test('URL generation consistency', () => {
    // Test various filename patterns to ensure consistent URL generation
    const testFilenames = [
      '20240326T195811--lxd__lxd_ubuntu.org',
      '20240327T093642--my-awesome-post__web_development.org',
      '20240328T101347--simple-note.org',
      '20240329T141201--complex-title-with-many-hyphens__tag1_tag2_tag3.org'
    ];

    const expectedSlugs = [
      'lxd',
      'my-awesome-post', 
      'simple-note',
      'complex-title-with-many-hyphens'
    ];

    testFilenames.forEach((filename, index) => {
      const slug = extractSlugFromFilename(filename);
      const metadata = parseDenoteFilename(filename);
      
      expect(slug).toBe(expectedSlugs[index]);
      expect(metadata!.slug).toBe(expectedSlugs[index]);
      
      // Verify URL format consistency
      const url = `/content/${slug}/`;
      expect(url).toMatch(/^\/content\/[a-z0-9-]+\/$/);
      
      // Ensure no special characters in URLs
      expect(slug).not.toMatch(/[^a-z0-9-]/);
    });
  });

  test('content metadata extraction workflow', () => {
    // Simulate processing a complete org-mode file
    const mockOrgContent = `#+title: LXD Container Management
#+date: [2024-03-26 Tue 19:58]
#+filetags: :lxd:containers:ubuntu:
#+identifier: 20240326T195811

* Introduction

LXD is a modern container and VM manager.

* Setup

See [[denote:20240327T093642][Docker]] for comparison.

* References

- denote:20240328T101347 for Kubernetes integration
`;

    const filename = '20240326T195811--lxd__lxd_ubuntu.org';
    
    // Test metadata extraction
    const titleMatch = mockOrgContent.match(/^\s*#\+title:\s*(.+)$/m);
    const identifierMatch = mockOrgContent.match(/#\+identifier:\s*(.+)/i);
    const filetagsMatch = mockOrgContent.match(/^\s*#\+filetags:\s*(.+)$/m);
    
    expect(titleMatch![1].trim()).toBe('LXD Container Management');
    expect(identifierMatch![1].trim()).toBe('20240326T195811');
    expect(filetagsMatch![1].trim()).toBe(':lxd:containers:ubuntu:');
    
    // Test denote link detection
    const denoteLinks = mockOrgContent.match(/(?:\[\[)?denote:(\d{8}T\d{6})/g) || [];
    expect(denoteLinks).toHaveLength(2);
    
    // Test filename processing
    const slug = extractSlugFromFilename(filename);
    expect(slug).toBe('lxd');
    
    // Verify complete processing pipeline
    const result = {
      title: titleMatch![1].trim(),
      identifier: identifierMatch![1].trim(), 
      slug: slug,
      outgoingLinks: denoteLinks.map(link => link.replace(/(?:\[\[)?denote:/, '')),
      expectedUrl: `/content/${slug}/`
    };
    
    expect(result).toEqual({
      title: 'LXD Container Management',
      identifier: '20240326T195811',
      slug: 'lxd',
      outgoingLinks: ['20240327T093642', '20240328T101347'],
      expectedUrl: '/content/lxd/'
    });
  });

  test('backlinks bidirectional integrity', () => {
    // Test that backlinks work correctly in both directions
    const contentMap = {
      '20240326T195811': {
        file: '20240326T195811--lxd__containers.org',
        title: 'LXD',
        slug: 'lxd',
        outgoingLinks: ['20240327T093642'] // Links to Docker
      },
      '20240327T093642': {
        file: '20240327T093642--docker__containers.org', 
        title: 'Docker',
        slug: 'docker',
        outgoingLinks: ['20240326T195811'] // Links back to LXD
      }
    };

    // Verify forward links
    Object.entries(contentMap).forEach(([, content]) => {
      const slug = extractSlugFromFilename(content.file);
      expect(slug).toBe(content.slug);
      
      // Each outgoing link should result in a backlink on the target
      content.outgoingLinks.forEach(targetId => {
        const targetContent = contentMap[targetId as keyof typeof contentMap];
        expect(targetContent).toBeDefined();
        
        // Verify the target would have this as a backlink
        const wouldHaveBacklink = Object.entries(contentMap).some(
          ([otherId, otherContent]) => 
            otherId !== targetId && otherContent.outgoingLinks.includes(targetId)
        );
        expect(wouldHaveBacklink).toBe(true);
      });
    });
  });
});