import { categoryRepository } from '../repositories/category.repository';
import { Category } from '../types';
import { CreateCategoryInput, UpdateCategoryInput } from '../validators/category.validator';

export class CategoryService {
  async getAllCategories(): Promise<Category[]> {
    return categoryRepository.findAll();
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw { statusCode: 404, message: 'Category not found' };
    }
    return category;
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const existing = await categoryRepository.findByName(input.name);
    if (existing) {
      throw { statusCode: 409, message: `Category '${input.name}' already exists` };
    }
    return categoryRepository.create(input.name, input.description);
  }

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw { statusCode: 404, message: 'Category not found' };
    }

    const duplicate = await categoryRepository.findByName(input.name);
    if (duplicate && duplicate.id !== id) {
      throw { statusCode: 409, message: `Category '${input.name}' already exists` };
    }

    const updated = await categoryRepository.update(id, input.name, input.description);
    if (!updated) {
      throw { statusCode: 500, message: 'Failed to update category' };
    }
    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await categoryRepository.findById(id);
    if (!category) {
      throw { statusCode: 404, message: 'Category not found' };
    }

    const productCount = await categoryRepository.countProducts(id);
    if (productCount > 0) {
      throw {
        statusCode: 400,
        message: `Cannot delete category '${category.name}' because it contains ${productCount} assigned product(s). Please reassign or delete the products first.`,
      };
    }

    await categoryRepository.delete(id);
  }
}

export const categoryService = new CategoryService();
