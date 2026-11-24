import { PoolClient } from 'pg';
import { query } from '../config/database';
import { Product } from '../types';
import { ProductQueryParams } from '../validators/product.validator';

export class ProductRepository {
  async findAll(params: ProductQueryParams): Promise<{ products: Product[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (params.search) {
      conditions.push(`(p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`);
      values.push(`%${params.search}%`);
      paramIndex++;
    }

    if (params.categoryId) {
      conditions.push(`p.category_id = $${paramIndex}`);
      values.push(params.categoryId);
      paramIndex++;
    }

    if (params.stockStatus) {
      if (params.stockStatus === 'OUT_OF_STOCK') {
        conditions.push(`p.stock_quantity = 0`);
      } else if (params.stockStatus === 'LOW_STOCK') {
        conditions.push(`p.stock_quantity > 0 AND p.stock_quantity <= p.reorder_level`);
      } else if (params.stockStatus === 'IN_STOCK') {
        conditions.push(`p.stock_quantity > p.reorder_level`);
      }
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sortMap: Record<string, string> = {
      name: 'p.name',
      price: 'p.unit_price',
      stock: 'p.stock_quantity',
      createdAt: 'p.created_at',
    };

    const sortByColumn = sortMap[params.sortBy || 'createdAt'] || 'p.created_at';
    const sortDirection = (params.sortOrder || 'desc').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count query
    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM products p
      ${whereClause};
    `;
    const countResult = await query<{ total: number }>(countSql, values);
    const total = countResult.rows[0]?.total || 0;

    // Items query with pagination
    const offset = ((params.page || 1) - 1) * (params.limit || 10);
    const limit = params.limit || 10;

    const dataSql = `
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
          WHEN p.stock_quantity <= p.reorder_level THEN 'LOW_STOCK'
          ELSE 'IN_STOCK'
        END AS stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY ${sortByColumn} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    values.push(limit, offset);
    const dataResult = await query<Product>(dataSql, values);

    return { products: dataResult.rows, total };
  }

  async findById(id: string): Promise<Product | null> {
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
          WHEN p.stock_quantity <= p.reorder_level THEN 'LOW_STOCK'
          ELSE 'IN_STOCK'
        END AS stock_status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1;
    `;
    const result = await query<Product>(sql, [id]);
    return result.rows[0] || null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const sql = `SELECT * FROM products WHERE UPPER(sku) = UPPER($1);`;
    const result = await query<Product>(sql, [sku.trim()]);
    return result.rows[0] || null;
  }

  async create(data: {
    sku: string;
    name: string;
    categoryId: string;
    description?: string | null;
    unitPrice: number;
    initialStock: number;
    reorderLevel: number;
  }, client?: PoolClient): Promise<Product> {
    const sql = `
      INSERT INTO products (sku, name, category_id, description, unit_price, stock_quantity, reorder_level)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const params = [
      data.sku.trim(),
      data.name.trim(),
      data.categoryId,
      data.description ? data.description.trim() : null,
      data.unitPrice,
      data.initialStock,
      data.reorderLevel,
    ];

    const result = client ? await client.query(sql, params) : await query(sql, params);
    return result.rows[0];
  }

  async update(id: string, data: {
    sku: string;
    name: string;
    categoryId: string;
    description?: string | null;
    unitPrice: number;
    reorderLevel: number;
  }): Promise<Product | null> {
    const sql = `
      UPDATE products
      SET 
        sku = $1,
        name = $2,
        category_id = $3,
        description = $4,
        unit_price = $5,
        reorder_level = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING *;
    `;
    const params = [
      data.sku.trim(),
      data.name.trim(),
      data.categoryId,
      data.description ? data.description.trim() : null,
      data.unitPrice,
      data.reorderLevel,
      id,
    ];
    const result = await query<Product>(sql, params);
    return result.rows[0] || null;
  }

  async countMovements(productId: string): Promise<number> {
    const sql = `SELECT COUNT(*)::int AS count FROM inventory_movements WHERE product_id = $1;`;
    const result = await query<{ count: number }>(sql, [productId]);
    return result.rows[0]?.count || 0;
  }

  async delete(id: string): Promise<boolean> {
    const sql = `DELETE FROM products WHERE id = $1;`;
    const result = await query(sql, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export const productRepository = new ProductRepository();
