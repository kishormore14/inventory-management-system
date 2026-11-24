import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { createProductSchema, productQuerySchema, updateProductSchema } from '../validators/product.validator';

const router = Router();

router.get('/', validateRequest(productQuerySchema, 'query'), (req, res, next) => productController.getAll(req, res, next));
router.get('/:id', (req, res, next) => productController.getById(req, res, next));
router.post('/', validateRequest(createProductSchema), (req, res, next) => productController.create(req, res, next));
router.put('/:id', validateRequest(updateProductSchema), (req, res, next) => productController.update(req, res, next));
router.delete('/:id', (req, res, next) => productController.delete(req, res, next));

export default router;
