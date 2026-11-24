import { query } from '../config/database';
import { CategoryValueStat, DashboardStats, InventoryMovement, Product } from '../types';

export class DashboardRepository {
  async getStats(): Promise<DashboardStats> {
    const sql = `
      SELECT 
        COUNT(*)::int AS total_products,
        COALESCE(SUM(stock_quantity), 0)::int AS total_inventory_units,
        COALESCE(SUM(stock_quantity * unit_price), 0)::float AS total_inventory_value,
        COUNT(CASE WHEN stock_quantity > 0 AND stock_quantity <= reorder_level THEN 1 END)::int AS low_stock_products,
        COUNT(CASE WHEN stock_quantity = 0 THEN 1 END)::int AS out_of_stock_products
      FROM products;
    `;
    const result = await query(sql);
    const row = result.rows[0] || {};
    return {
      totalProducts: row.total_products || 0,
      totalInventoryUnits: row.total_inventory_units || 0,
      totalInventoryValue: row.total_inventory_value || 0,
      lowStockProducts: row.low_stock_products || 0,
      outOfStockProducts: row.out_of_stock_products || 0,
    };
  }

  async getLowStockProducts(limit = 10): Promise<Product[]> {
    const sql = `
      SELECT 
        p.id,
        p.sku,
        p.name,
        p.category_id,
        c.name AS category_name,
        p.description,
        p.unit_price::float AS unit_price,
        p.stock_quantity,
        p.reorder_level,
        p.created_at,
        p.updated_at,
        CASE 
          WHEN p.stock_quantity = 0 THEN 'OUT_OF_STOCK'
          ELSE 'LOW_STOCK'
        END AS stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock_quantity <= p.reorder_level
      ORDER BY p.stock_quantity ASC, p.name ASC
      LIMIT $1;
    `;
    const result = await query<Product>(sql, [limit]);
    return result.rows;
  }

  async getRecentMovements(limit = 10): Promise<InventoryMovement[]> {
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
      ORDER BY m.created_at DESC
      LIMIT $1;
    `;
    const result = await query<InventoryMovement>(sql, [limit]);
    return result.rows;
  }

  async getCategoryValue(): Promise<CategoryValueStat[]> {
    const sql = `
      SELECT 
        c.id AS category_id,
        c.name AS category_name,
        COUNT(p.id)::int AS product_count,
        COALESCE(SUM(p.stock_quantity), 0)::int AS total_units,
        COALESCE(SUM(p.stock_quantity * p.unit_price), 0)::float AS total_value
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id, c.name
      ORDER BY total_value DESC;
    `;
    const result = await query(sql);
    return result.rows.map((row) => ({
      categoryId: row.category_id,
      categoryName: row.category_name,
      productCount: row.product_count,
      totalUnits: row.total_units,
      totalValue: row.total_value,
    }));
  }
}

export const dashboardRepository = new DashboardRepository();
