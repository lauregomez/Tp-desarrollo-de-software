import { Router } from 'express';
import { clubController } from './club.controller';

const router = Router();

router.get('/',       clubController.getAll);
router.get('/:id',    clubController.getById);
router.post('/',      clubController.create);
router.put('/:id',    clubController.update);
router.delete('/:id', clubController.remove);

export default router;