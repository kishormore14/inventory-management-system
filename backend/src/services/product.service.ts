import { getClient } from '../config/database';
import { categoryRepository } from '../repositories/category.repository';
import { inventoryRepository } from '../repositories/inventory.repository';
import { productRepository } from '../repositories/product.repository';
import { Product } from '../types';
import { CreateProductInput, ProductQueryParams, UpdateProductInput } from '../validators/product.validator';

export class ProductService {
  async getAllProducts(params: ProductQueryParams): Promise<{ products: Product[]; total: number }> {
    return productRepository.findAll(params);
  }

  async getProductById(id: string): Promise<Product> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw { statusCode: 404, message: 'Product not found' };
    }
    return product;
  }

  async createProduct(input: CreateProductInput): Promise<Product> {
    // 1. Verify Category exists
    const category = await categoryRepository.findById(input.categoryId);
    if (!category) {
      throw { statusCode: 400, message: 'Specified category does not exist' };
    }

    // 2. Verify SKU is unique
    const existingSku = await productRepository.findBySku(input.sku);
    if (existingSku) {
      throw { statusCode: 409, message: `Product with SKU '${input.sku}' already exists` };
    }

    // 3. Atomically create product and record initial inventory movement if initialStock > 0
    const client = await getClient();
    try {
      await client.query('BEGIN');

      const product = await productRepository.create(input, client);

      if (input.initialStock > 0) {
        await inventoryRepository.createMovement(client, {
          productId: product.id,
          movementType: 'STOCK_IN',
          quantityChange: input.initialStock,
          previousStock: 0,
          newStock: input.initialStock,
          referenceNumber: 'INITIAL-STOCK',
          notes: 'Initial inventory intake during product creation',
        });
      }

      await client.query('COMMIT');
      return product;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateProduct(id: string, input: UpdateProductInput): Promise<Product> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw { statusCode: 404, message: 'Product not found' };
    }

    // Check category
    const category = await categoryRepository.findById(input.categoryId);
    if (!category) {
      throw { statusCode: 400, message: 'Specified category does not exist' };
    }

    // Check SKU uniqueness
    const duplicate = await productRepository.findBySku(input.sku);
    if (duplicate && duplicate.id !== id) {
      throw { statusCode: 409, message: `Product with SKU '${input.sku}' already exists` };
    }

    const updated = await productRepository.update(id, input);
    if (!updated) {
      throw { statusCode: 500, message: 'Failed to update product' };
    }
    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await productRepository.findById(id);
    if (!product) {
      throw { statusCode: 404, message: 'Product not found' };
    }

    const movementsCount = await productRepository.countMovements(id);
    if (movementsCount > 0) {
      throw {
        statusCode: 400,
        message: `Cannot delete product '${product.name}' (${product.sku}) because it has ${movementsCount} associated inventory movement audit record(s). Deleting auditable products is prohibited to maintain ledger integrity.`,
      };
    }

    await productRepository.delete(id);
  }
}

export const productService = new ProductService();
