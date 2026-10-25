import express from 'express';
import { createInquiry, getMyInquiries, updateInquiryStatus } from '../controllers/inquiryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { inquiryLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/', protect, inquiryLimiter, createInquiry);
router.get('/my', protect, getMyInquiries);
router.put('/:id/status', protect, updateInquiryStatus);

export default router;

