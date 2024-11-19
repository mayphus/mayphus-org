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

const articles = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string().optional(),
		date: z.coerce.date().optional(),
		filetags: z.array(z.string()).optional(),
		description: z.string().optional(),
	}),
});

const projects = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
	}),
});

const learn = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string().optional(),
	}),
});

export const collections = { 
  'notes': notes,
  'articles': articles,
  'projects': projects,
  'learn': learn,
};
