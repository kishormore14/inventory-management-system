import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Category name is required')
    .max(100, 'Category name must not exceed 100 characters'),
  description: z.string().trim().max(500, 'Description must not exceed 500 characters').nullable().optional(),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Category name is required')
    .max(100, 'Category name must not exceed 100 characters'),
  description: z.string().trim().max(500, 'Description must not exceed 500 characters').nullable().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
