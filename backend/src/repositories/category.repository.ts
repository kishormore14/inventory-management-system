import { query } from '../config/database';
import { Category } from '../types';

export class CategoryRepository {
  async findAll(): Promise<Category[]> {
    const sql = `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.created_at,
        COUNT(p.id)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.name ASC;
    `;
    const result = await query<Category>(sql);
    return result.rows;
  }

  async findById(id: string): Promise<Category | null> {
    const sql = `
      SELECT 
        c.id,
        c.name,
        c.description,
        c.created_at,
        COUNT(p.id)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.id = $1
      GROUP BY c.id;
    `;
    const result = await query<Category>(sql, [id]);
    return result.rows[0] || null;
  }

  async findByName(name: string): Promise<Category | null> {
    const sql = `SELECT * FROM categories WHERE LOWER(name) = LOWER($1);`;
    const result = await query<Category>(sql, [name.trim()]);
    return result.rows[0] || null;
  }

  async create(name: string, description?: string | null): Promise<Category> {
    const sql = `
      INSERT INTO categories (name, description)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const result = await query<Category>(sql, [name.trim(), description ? description.trim() : null]);
    return result.rows[0];
  }

  async update(id: string, name: string, description?: string | null): Promise<Category | null> {
    const sql = `
      UPDATE categories
      SET name = $1, description = $2
      WHERE id = $3
      RETURNING *;
    `;
    const result = await query<Category>(sql, [name.trim(), description ? description.trim() : null, id]);
    return result.rows[0] || null;
  }

  async countProducts(id: string): Promise<number> {
    const sql = `SELECT COUNT(*)::int AS count FROM products WHERE category_id = $1;`;
    const result = await query<{ count: number }>(sql, [id]);
    return result.rows[0]?.count || 0;
  }

  async delete(id: string): Promise<boolean> {
    const sql = `DELETE FROM categories WHERE id = $1;`;
    const result = await query(sql, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export const categoryRepository = new CategoryRepository();
