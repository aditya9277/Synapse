import { Router } from 'express';
import { collectionController } from '../controllers/collection.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', collectionController.create);
router.get('/', collectionController.getAll);
router.get('/:id', collectionController.getById);
router.patch('/:id', collectionController.update);
router.delete('/:id', collectionController.delete);
router.post('/:id/items', collectionController.addItem);
router.delete('/:id/items/:contentId', collectionController.removeItem);

export default router;
