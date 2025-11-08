import { z } from 'zod';

export const contentTypeEnum = z.enum([
  'URL',
  'ARTICLE',
  'PRODUCT',
  'VIDEO',
  'IMAGE',
  'NOTE',
  'TODO',
  'CODE',
  'PDF',
  'SCREENSHOT',
  'HANDWRITTEN',
  'AUDIO',
  'BOOKMARK'
]);

export const createContentSchema = z.object({
  type: contentTypeEnum,
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().optional(),
  url: z.string().url().optional().or(z.literal('')),
  contentText: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  priority: z.number().int().min(0).max(5).optional(),
  thumbnailUrl: z.string().url().optional().or(z.literal('')),
  source: z.string().optional()
});

export const updateContentSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  contentText: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  category: z.string().optional(),
  priority: z.number().int().min(0).max(5).optional(),
  isFavorite: z.boolean().optional(),
  isArchived: z.boolean().optional()
});

export const queryContentSchema = z.object({
  type: contentTypeEnum.optional(),
  category: z.string().optional(),
  tags: z.string().optional(), // comma-separated
  isFavorite: z.string().optional(),
  isArchived: z.string().optional(),
  search: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'accessedAt', 'title', 'priority']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export type CreateContentInput = z.infer<typeof createContentSchema>;
export type UpdateContentInput = z.infer<typeof updateContentSchema>;
export type QueryContentInput = z.infer<typeof queryContentSchema>;
