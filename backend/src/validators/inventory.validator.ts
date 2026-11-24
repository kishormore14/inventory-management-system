import { z } from 'zod';

export const stockInSchema = z.object({
  productId: z.string().uuid('Invalid Product ID'),
  quantity: z.coerce.number().int('Quantity must be an integer').min(1, 'Quantity must be greater than zero'),
  referenceNumber: z.string().trim().max(100).optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const stockOutSchema = z.object({
  productId: z.string().uuid('Invalid Product ID'),
  quantity: z.coerce.number().int('Quantity must be an integer').min(1, 'Quantity must be greater than zero'),
  referenceNumber: z.string().trim().max(100).optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const stockAdjustmentSchema = z.object({
  productId: z.string().uuid('Invalid Product ID'),
  actualStock: z.coerce.number().int('Actual stock must be an integer').min(0, 'Actual stock cannot be negative'),
  referenceNumber: z.string().trim().max(100).optional().nullable(),
  notes: z.string().trim().min(1, 'Notes are required for stock adjustments').max(500),
});

export const movementQuerySchema = z.object({
  productId: z.string().uuid().optional(),
  movementType: z.enum(['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT']).optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type StockInInput = z.infer<typeof stockInSchema>;
export type StockOutInput = z.infer<typeof stockOutSchema>;
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;
export type MovementQueryParams = z.infer<typeof movementQuerySchema>;
