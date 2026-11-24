import { NextFunction, Request, Response } from 'express';
import { inventoryService } from '../services/inventory.service';
import { ApiResponse } from '../types';

export class InventoryController {
  async stockIn(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const movement = await inventoryService.stockIn(req.body);
      res.status(200).json({
        success: true,
        message: 'Stock-in operation completed successfully',
        data: movement,
      });
    } catch (error) {
      next(error);
    }
  }

  async stockOut(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const movement = await inventoryService.stockOut(req.body);
      res.status(200).json({
        success: true,
        message: 'Stock-out operation completed successfully',
        data: movement,
      });
    } catch (error) {
      next(error);
    }
  }

  async adjustment(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const movement = await inventoryService.stockAdjustment(req.body);
      res.status(200).json({
        success: true,
        message: 'Stock adjustment completed successfully',
        data: movement,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMovements(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const result = await inventoryService.getMovements(req.query as any);
      res.status(200).json({
        success: true,
        message: 'Movements fetched successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMovementById(req: Request, res: Response<ApiResponse>, next: NextFunction) {
    try {
      const movement = await inventoryService.getMovementById(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Movement details fetched successfully',
        data: movement,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const inventoryController = new InventoryController();
