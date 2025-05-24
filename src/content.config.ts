import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const notes = defineCollection({
	loader: glob({ pattern: "*.org", base: "./notes" }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		filetags: z.array(z.string()).optional(),
		description: z.string().optional(),
		slug: z.string(),
	}),
});

export const collections = { notes }; 