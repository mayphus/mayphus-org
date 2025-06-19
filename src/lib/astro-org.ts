import fs from 'node:fs/promises';

import type { AstroIntegration, ContainerRenderer, ContentEntryType, HookParameters } from 'astro';
import type { Plugin as VitePlugin, ResolvedConfig } from 'vite';

import { unified, type PluggableList } from 'unified';
import { VFile } from 'vfile';
import uniorg from 'uniorg-parse';
import orgPlugin, { type OrgPluginOptions } from 'rollup-plugin-orgx';
import { extractKeywords } from 'uniorg-extract-keywords';
import { uniorgSlug } from 'uniorg-slug';
import { fileURLToPath } from 'node:url';
import { resolveDenotLinks } from './plugins/denote-links.js';
import { addBackLinks } from './plugins/backlinks.js';
import { processFrontmatter } from './plugins/frontmatter.js';
import { CONFIG } from '../config.js';

declare module 'vfile' {
  interface DataMap {
    astro: {
      frontmatter?: Record<string, any> | undefined;
      headings?: import('astro').MarkdownHeading[] | undefined;
      localImagePaths?: string[] | undefined;
      remoteImagePaths?: string[] | undefined;
    };
  }
}

interface ExtendedOrgPluginOptions extends OrgPluginOptions {
  uniorgPlugins?: PluggableList;
  rehypePlugins?: PluggableList;
}

interface VitePluginWithName extends VitePlugin {
  name: string;
}

export type Options = ExtendedOrgPluginOptions;

type SetupHookParams = HookParameters<'astro:config:setup'> & {
  // `addPageExtension` and `contentEntryType` are not a public APIs
  // Add type defs here
  addPageExtension: (extension: string) => void;
  addContentEntryType: (contentEntryType: ContentEntryType) => void;
};

export function getContainerRenderer(): ContainerRenderer {
  return {
    name: 'astro:jsx',
    serverEntrypoint: 'astro-org/server.js',
  };
}

export default function org(options: ExtendedOrgPluginOptions = {}): AstroIntegration {
  const uniorgPlugins: PluggableList = [
    initFrontmatter,
    [extractKeywords, { name: 'keywords' }],
    keywordsToFrontmatter,
    processFrontmatter,
    uniorgSlug,
    ...(options.uniorgPlugins ?? []),
  ];

  return {
    name: 'astro-org',
    hooks: {
      'astro:config:setup': async (params) => {
        const {
          updateConfig,
          addRenderer,
          addContentEntryType,
          addPageExtension,
        } = params as SetupHookParams;

        addRenderer({
          name: 'astro:jsx',
          serverEntrypoint: new URL('./server.js', import.meta.url),
        });
        addPageExtension(CONFIG.ORG_FILE_EXTENSION);
        addContentEntryType({
          extensions: [...CONFIG.SUPPORTED_EXTENSIONS],
          async getEntryInfo({ fileUrl, contents }) {
            const processor = unified().use(uniorg).use(uniorgPlugins);

            const f = new VFile({ path: fileURLToPath(fileUrl), value: contents });
            await processor.run(processor.parse(f), f);

            const frontmatter = f.data.astro?.frontmatter || {};
            return {
              data: frontmatter,
              body: contents,
              // Astro typing requires slug to be a string, however
              // I'm pretty sure that mdx integration returns
              // undefined if slug is not set in frontmatter.
              slug: frontmatter.slug as any,
              rawData: contents,
            };
          },
          contentModuleTypes: await fs.readFile(
            new URL('./content-module-types.d.ts', import.meta.url),
            'utf-8'
          ),
          handlePropagation: true,
        });
        updateConfig({
          vite: {
            plugins: [
              {
                enforce: 'pre',
                configResolved(resolved: ResolvedConfig) {
                  // Reorder plugins for proper transformation sequence
                  reorderPlugins(resolved);
                },
                ...orgPlugin({
                  ...options,
                  uniorgPlugins,
                  rehypePlugins: [
                    ...(options.rehypePlugins ?? []),
                    resolveDenotLinks,
                    addBackLinks,
                    // rehypeExportFrontmatter,
                  ],
                  development: false,
                  jsxImportSource: 'astro',
                } as ExtendedOrgPluginOptions),
              },
              {
                name: 'astro-org/postprocess',
                transform: (code: string, id: string) => {
                  if (!id.endsWith(CONFIG.ORG_FILE_EXTENSION)) {
                    return;
                  }

                  const fileId = id.split('?')[0];

                  code += `\nexport { Content };`;
                  code += `\nContent[Symbol.for('org-component')] = true;`;
                  code += `\nexport const file = ${JSON.stringify(fileId)};`;

                  return code;
                },
              },
            ],
          },
        });
      },
    },
  };
}

function initFrontmatter() {
  return transformer;

  function transformer(_tree: unknown, file: VFile) {
    if (!file.data.astro) {
      file.data.astro = { frontmatter: {} };
    }
  }
}

function keywordsToFrontmatter() {
  return transformer;

  function transformer(_tree: unknown, file: VFile) {
    if (!file.data.astro) {
      file.data.astro = { frontmatter: {} };
    }
    file.data.astro.frontmatter = {
      ...file.data.astro.frontmatter,
      ...(file.data.keywords as Record<string, any> || {}),
    };
  }
}

// Helper function to reorder plugins safely
function reorderPlugins(resolved: ResolvedConfig): void {
  const plugins = resolved.plugins as VitePluginWithName[];
  
  const jsxPluginIndex = plugins.findIndex(
    (p) => p.name === 'astro:jsx'
  );
  const orgPluginIndex = plugins.findIndex(
    (p) => p.name === 'rollup-plugin-orgx'
  );
  
  if (jsxPluginIndex !== -1 && orgPluginIndex !== -1 && orgPluginIndex > jsxPluginIndex) {
    const orgPlugin = plugins[orgPluginIndex];
    // Remove from current position
    plugins.splice(orgPluginIndex, 1);
    // Insert before JSX plugin
    plugins.splice(jsxPluginIndex, 0, orgPlugin);
  }
}

