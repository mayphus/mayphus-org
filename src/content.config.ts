import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const content = defineCollection({
	loader: glob({ pattern: "*.org", base: "./content" }),
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		filetags: z.array(z.string()).optional(),
		description: z.string().optional(),
		slug: z.string(),
		identifier: z.string().optional(),
	}),
});

export const collections = { content }; 