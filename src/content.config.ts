import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// role picks the colour everywhere the symbol appears: one role = one colour.
const roleEnum = z.enum(['weight', 'input', 'output', 'loss', 'other']);
const sym = z.union([z.string(), z.object({ tex: z.string().optional(), means: z.string(), role: roleEnum.optional() })]);

const lessons = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/lessons' }),
  schema: z.object({
    title: z.string(),
    blurb: z.string().optional(),
    order: z.number().default(99),
    prereqs: z.array(z.string()).default([]), // lesson or legacy slugs; checked in [slug].astro
    pipeline: z.array(z.string()).min(1),
    concepts: z.record(z.string(), z.string()),
    symbols: z.record(z.string(), sym),
    ref: z.string().optional(),
  }),
});

export const collections = { lessons };
