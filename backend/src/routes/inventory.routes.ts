import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';
import { validateRequest } from '../middleware/validation.middleware';
import {
  movementQuerySchema,
  stockAdjustmentSchema,
  stockInSchema,
  stockOutSchema,
} from '../validators/inventory.validator';

const router = Router();

router.post('/stock-in', validateRequest(stockInSchema), (req, res, next) =>
  inventoryController.stockIn(req, res, next)
);

router.post('/stock-out', validateRequest(stockOutSchema), (req, res, next) =>
  inventoryController.stockOut(req, res, next)
);

router.post('/adjustment', validateRequest(stockAdjustmentSchema), (req, res, next) =>
  inventoryController.adjustment(req, res, next)
);

router.get('/movements', validateRequest(movementQuerySchema, 'query'), (req, res, next) =>
  inventoryController.getMovements(req, res, next)
);

router.get('/movements/:id', (req, res, next) =>
  inventoryController.getMovementById(req, res, next)
);

export default router;
