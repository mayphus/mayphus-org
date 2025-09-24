import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

import { SITE_CONFIG } from './lib/site';

const contentBase = SITE_CONFIG.contentDir.startsWith('.')
  ? SITE_CONFIG.contentDir
  : `./${SITE_CONFIG.contentDir}`;

const content = defineCollection({
  loader: glob({ pattern: "*.org", base: contentBase }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date().optional(),
    filetags: z.array(z.string()).optional(),
    description: z.string().optional(),
    slug: z.string(),
    identifier: z.string().optional(),
  }),
});

export const collections = { content }; 
