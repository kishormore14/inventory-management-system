import { NextFunction, Request, Response } from 'express';
import { productService } from '../services/product.service';
import { ApiResponse } from '../types';

export class ProductController {
  async getAll(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const result = await productService.getAllProducts(req.query as any);
      res.status(200).json({
        success: true,
        message: 'Products fetched successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const product = await productService.getProductById(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Product fetched successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const product = await productService.updateProduct(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      await productService.deleteProduct(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
