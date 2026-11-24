import { Router } from 'express';
import { categoryController } from '../controllers/category.controller';
import { validateRequest } from '../middleware/validation.middleware';
import { createCategorySchema, updateCategorySchema } from '../validators/category.validator';

const router = Router();

router.get('/', (req, res, next) => categoryController.getAll(req, res, next));
router.get('/:id', (req, res, next) => categoryController.getById(req, res, next));
router.post('/', validateRequest(createCategorySchema), (req, res, next) => categoryController.create(req, res, next));
router.put('/:id', validateRequest(updateCategorySchema), (req, res, next) => categoryController.update(req, res, next));
router.delete('/:id', (req, res, next) => categoryController.delete(req, res, next));

export default router;
