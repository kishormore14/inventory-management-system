import { PoolClient } from 'pg';
import { query } from '../config/database';
import { InventoryMovement } from '../types';
import { MovementQueryParams } from '../validators/inventory.validator';

export class InventoryRepository {
  async lockProductForUpdate(client: PoolClient, productId: string): Promise<{ id: string; stock_quantity: number; name: string; sku: string } | null> {
    const sql = `
      SELECT id, stock_quantity, name, sku
      FROM products
      WHERE id = $1
      FOR UPDATE;
    `;
    const result = await client.query(sql, [productId]);
    return result.rows[0] || null;
  }

  async updateProductStock(client: PoolClient, productId: string, newStock: number): Promise<void> {
    const sql = `
      UPDATE products
      SET stock_quantity = $1, updated_at = NOW()
      WHERE id = $2;
    `;
    await client.query(sql, [newStock, productId]);
  }

  async createMovement(
    client: PoolClient,
    movement: {
      productId: string;
      movementType: 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT';
      quantityChange: number;
      previousStock: number;
      newStock: number;
      referenceNumber?: string | null;
      notes?: string | null;
    }
  ): Promise<InventoryMovement> {
    const sql = `
      INSERT INTO inventory_movements (
        product_id,
        movement_type,
        quantity_change,
        previous_stock,
        new_stock,
        reference_number,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const result = await client.query<InventoryMovement>(sql, [
      movement.productId,
      movement.movementType,
      movement.quantityChange,
      movement.previousStock,
      movement.newStock,
      movement.referenceNumber ? movement.referenceNumber.trim() : null,
      movement.notes ? movement.notes.trim() : null,
    ]);
    return result.rows[0];
  }

  async findAllMovements(params: MovementQueryParams): Promise<{ movements: InventoryMovement[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.productId) {
      conditions.push(`m.product_id = $${paramIndex}`);
      values.push(params.productId);
      paramIndex++;
    }

    if (params.movementType) {
      conditions.push(`m.movement_type = $${paramIndex}`);
      values.push(params.movementType);
      paramIndex++;
    }

    if (params.search) {
      conditions.push(`(p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR m.reference_number ILIKE $${paramIndex})`);
      values.push(`%${params.search}%`);
      paramIndex++;
    }

    if (params.startDate) {
      conditions.push(`m.created_at >= $${paramIndex}`);
      values.push(params.startDate);
      paramIndex++;
    }

    if (params.endDate) {
      conditions.push(`m.created_at <= $${paramIndex}`);
      values.push(params.endDate);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM inventory_movements m
      JOIN products p ON m.product_id = p.id
      ${whereClause};
    `;
    const countResult = await query<{ total: number }>(countSql, values);
    const total = countResult.rows[0]?.total || 0;

    const offset = ((params.page || 1) - 1) * (params.limit || 10);
    const limit = params.limit || 10;

    const dataSql = `
      SELECT 
        m.id,
        m.product_id,
        p.name AS product_name,
        p.sku,
        m.movement_type,
        m.quantity_change,
        m.previous_stock,
        m.new_stock,
        m.reference_number,
        m.notes,
        m.created_at
      FROM inventory_movements m
      JOIN products p ON m.product_id = p.id
      ${whereClause}
      ORDER BY m.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    values.push(limit, offset);
    const dataResult = await query<InventoryMovement>(dataSql, values);

    return { movements: dataResult.rows, total };
  }

  async findMovementById(id: string): Promise<InventoryMovement | null> {
    const sql = `
      SELECT 
        m.id,
        m.product_id,
        p.name AS product_name,
        p.sku,
        m.movement_type,
        m.quantity_change,
        m.previous_stock,
        m.new_stock,
        m.reference_number,
        m.notes,
        m.created_at
      FROM inventory_movements m
      JOIN products p ON m.product_id = p.id
      WHERE m.id = $1;
    `;
    const result = await query<InventoryMovement>(sql, [id]);
    return result.rows[0] || null;
  }
}

export const inventoryRepository = new InventoryRepository();
