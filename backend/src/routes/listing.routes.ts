import { Router } from 'express';
import { ListingController } from '../controllers/listing.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Protect all listing routes with authentication
router.use(authenticateToken);

router.get('/feed', ListingController.getFeed);
router.post('/swipe', ListingController.swipe);

export default router;
