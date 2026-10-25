import express from 'express';
import { addReview, deleteReview, checkReviewEligibility } from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { reviewLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/eligibility/:tutorId', protect, checkReviewEligibility);
router.post('/', protect, reviewLimiter, addReview);
router.delete('/:id', protect, authorize('admin'), deleteReview);

export default router;

