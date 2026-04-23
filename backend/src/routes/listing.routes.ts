import { Router } from 'express';
import { ListingController } from '../controllers/listing.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { upload } from '../utils/upload';

const router = Router();

// Protect all listing routes with authentication
router.use(authenticateToken);

router.get('/feed', ListingController.getFeed);
router.post('/swipe', ListingController.swipe);
router.post('/', upload.single('image'), ListingController.create);
router.get('/my', ListingController.getMyListings);
router.patch('/:id/sold', ListingController.markAsSold);

export default router;
