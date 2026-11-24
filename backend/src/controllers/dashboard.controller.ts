import { NextFunction, Request, Response } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { ApiResponse } from '../types';

export class DashboardController {
  async getStats(_req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const stats = await dashboardService.getStats();
      res.status(200).json({
        success: true,
        message: 'Dashboard statistics fetched successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  async getLowStock(_req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const lowStock = await dashboardService.getLowStockProducts();
      res.status(200).json({
        success: true,
        message: 'Low stock products fetched successfully',
        data: lowStock,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecentMovements(_req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const recent = await dashboardService.getRecentMovements();
      res.status(200).json({
        success: true,
        message: 'Recent movements fetched successfully',
        data: recent,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryValue(_req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const categoryValue = await dashboardService.getCategoryValue();
      res.status(200).json({
        success: true,
        message: 'Category inventory valuations fetched successfully',
        data: categoryValue,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
