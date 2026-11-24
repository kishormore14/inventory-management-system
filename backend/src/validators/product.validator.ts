import { z } from 'zod';

export const createProductSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(1, 'SKU is required')
    .max(100, 'SKU must not exceed 100 characters')
    .regex(/^[A-Za-z0-9-_]+$/, 'SKU may only contain letters, numbers, hyphens, and underscores'),
  name: z
    .string()
    .trim()
    .min(1, 'Product name is required')
    .max(255, 'Product name must not exceed 255 characters'),
  categoryId: z.string().uuid('Invalid Category ID'),
  description: z.string().trim().max(1000).nullable().optional(),
  unitPrice: z.coerce.number().min(0, 'Unit price must be greater than or equal to 0'),
  initialStock: z.coerce.number().int('Initial stock must be an integer').min(0, 'Initial stock must be >= 0').default(0),
  reorderLevel: z.coerce.number().int('Reorder level must be an integer').min(0, 'Reorder level must be >= 0').default(0),
});

export const updateProductSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(1, 'SKU is required')
    .max(100, 'SKU must not exceed 100 characters')
    .regex(/^[A-Za-z0-9-_]+$/, 'SKU may only contain letters, numbers, hyphens, and underscores'),
  name: z
    .string()
    .trim()
    .min(1, 'Product name is required')
    .max(255, 'Product name must not exceed 255 characters'),
  categoryId: z.string().uuid('Invalid Category ID'),
  description: z.string().trim().max(1000).nullable().optional(),
  unitPrice: z.coerce.number().min(0, 'Unit price must be greater than or equal to 0'),
  reorderLevel: z.coerce.number().int('Reorder level must be an integer').min(0, 'Reorder level must be >= 0'),
});

export const productQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  stockStatus: z.enum(['ALL', 'IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']).optional().default('ALL'),
  sortBy: z.enum(['name', 'price', 'stock', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQueryParams = z.infer<typeof productQuerySchema>;
