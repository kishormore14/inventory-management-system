import { getClient } from '../config/database';
import { inventoryRepository } from '../repositories/inventory.repository';
import { InventoryMovement } from '../types';
import {
  MovementQueryParams,
  StockAdjustmentInput,
  StockInInput,
  StockOutInput,
} from '../validators/inventory.validator';

export class InventoryService {
  /**
   * CRITICAL ATOMIC TRANSACTION: Stock In
   * 1. Start a transaction
   * 2. Lock product row via SELECT FOR UPDATE
   * 3. Fetch current stock
   * 4. Calculate new stock
   * 5. Update product stock
   * 6. Record inventory movement
   * 7. Commit transaction
   */
  async stockIn(input: StockInInput): Promise<InventoryMovement> {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const product = await inventoryRepository.lockProductForUpdate(client, input.productId);
      if (!product) {
        throw { statusCode: 404, message: 'Product not found' };
      }

      const previousStock = product.stock_quantity;
      const newStock = previousStock + input.quantity;

      await inventoryRepository.updateProductStock(client, input.productId, newStock);

      const movement = await inventoryRepository.createMovement(client, {
        productId: input.productId,
        movementType: 'STOCK_IN',
        quantityChange: input.quantity,
        previousStock,
        newStock,
        referenceNumber: input.referenceNumber,
        notes: input.notes,
      });

      await client.query('COMMIT');
      return movement;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * CRITICAL ATOMIC TRANSACTION: Stock Out
   * 1. Start a transaction
   * 2. Lock product row via SELECT FOR UPDATE
   * 3. Check sufficient stock (prevent negative)
   * 4. Calculate new stock
   * 5. Update product stock
   * 6. Record inventory movement
   * 7. Commit transaction
   */
  async stockOut(input: StockOutInput): Promise<InventoryMovement> {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const product = await inventoryRepository.lockProductForUpdate(client, input.productId);
      if (!product) {
        throw { statusCode: 404, message: 'Product not found' };
      }

      const previousStock = product.stock_quantity;
      if (previousStock < input.quantity) {
        throw {
          statusCode: 400,
          message: `Insufficient stock for '${product.name}'. Current stock is ${previousStock}, but ${input.quantity} was requested.`,
        };
      }

      const newStock = previousStock - input.quantity;

      await inventoryRepository.updateProductStock(client, input.productId, newStock);

      const movement = await inventoryRepository.createMovement(client, {
        productId: input.productId,
        movementType: 'STOCK_OUT',
        quantityChange: -input.quantity,
        previousStock,
        newStock,
        referenceNumber: input.referenceNumber,
        notes: input.notes,
      });

      await client.query('COMMIT');
      return movement;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * CRITICAL ATOMIC TRANSACTION: Stock Adjustment
   * Calculates difference (actualStock - currentStock)
   * Prevents negative stock
   */
  async stockAdjustment(input: StockAdjustmentInput): Promise<InventoryMovement> {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const product = await inventoryRepository.lockProductForUpdate(client, input.productId);
      if (!product) {
        throw { statusCode: 404, message: 'Product not found' };
      }

      const previousStock = product.stock_quantity;
      const newStock = input.actualStock;
      const quantityChange = newStock - previousStock;

      if (quantityChange === 0) {
        throw {
          statusCode: 400,
          message: `Actual stock is identical to current stock (${previousStock}). No adjustment needed.`,
        };
      }

      await inventoryRepository.updateProductStock(client, input.productId, newStock);

      const movement = await inventoryRepository.createMovement(client, {
        productId: input.productId,
        movementType: 'ADJUSTMENT',
        quantityChange,
        previousStock,
        newStock,
        referenceNumber: input.referenceNumber,
        notes: input.notes,
      });

      await client.query('COMMIT');
      return movement;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getMovements(params: MovementQueryParams): Promise<{ movements: InventoryMovement[]; total: number }> {
    return inventoryRepository.findAllMovements(params);
  }

  async getMovementById(id: string): Promise<InventoryMovement> {
    const movement = await inventoryRepository.findMovementById(id);
    if (!movement) {
      throw { statusCode: 404, message: 'Inventory movement not found' };
    }
    return movement;
  }
}

export const inventoryService = new InventoryService();
