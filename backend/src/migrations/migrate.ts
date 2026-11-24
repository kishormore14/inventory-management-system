import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

export const runMigrations = async () => {
  console.log('Running database migrations...');
  const sqlPath = path.join(__dirname, '001_initial_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log('Migrations executed successfully.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
};

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migration process finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration process failed:', err);
      process.exit(1);
    });
}
