import { defineCollection, z } from 'astro:content';

const notes = defineCollection({
	type: 'content',
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string().optional(),
		date: z.coerce.date(),
		filetags: z.array(z.string()).optional(),
	}),
});

export const collections = { notes };
