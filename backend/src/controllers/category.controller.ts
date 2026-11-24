import { NextFunction, Request, Response } from 'express';
import { categoryService } from '../services/category.service';
import { ApiResponse } from '../types';

export class CategoryController {
  async getAll(_req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const categories = await categoryService.getAllCategories();
      res.status(200).json({
        success: true,
        message: 'Categories fetched successfully',
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const category = await categoryService.getCategoryById(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Category fetched successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const category = await categoryService.updateCategory(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      await categoryService.deleteCategory(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
