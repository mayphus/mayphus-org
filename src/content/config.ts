import { defineCollection, z } from 'astro:content';

const notes = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		date: z.coerce.date(),
		filetags: z.array(z.string()).optional(),
		description: z.string().optional(),
	}),
});

export const collections = { 
  'notes': notes,
};
