import { Router } from 'express';
import { authController } from './auth.controller';
import { asyncHandler } from '../../middlewares/asyncHandler';

const router = Router();

router.post('/register', asyncHandler(authController.register));
router.post('/login',    asyncHandler(authController.login));

export default router;