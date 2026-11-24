import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';

const router = Router();

router.get('/stats', (req, res, next) => dashboardController.getStats(req, res, next));
router.get('/low-stock', (req, res, next) => dashboardController.getLowStock(req, res, next));
router.get('/recent-movements', (req, res, next) => dashboardController.getRecentMovements(req, res, next));
router.get('/category-value', (req, res, next) => dashboardController.getCategoryValue(req, res, next));

export default router;
