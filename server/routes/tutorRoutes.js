import express from 'express';
import { 
  getTutors, 
  getTutorById, 
  getMyProfile,
  updateMyProfile, 
  uploadVerificationDocuments, 
  deleteVerificationDocument,
  getImageKitAuth,
  getMyNotices,
  markNoticeAsRead,
  deleteNotice
} from '../controllers/tutorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getTutors);
router.get('/my-profile', protect, authorize('tutor'), getMyProfile);
router.get('/imagekit-auth', protect, getImageKitAuth);
router.get('/my-notices', protect, authorize('tutor'), getMyNotices);
router.put('/my-notices/:id/read', protect, authorize('tutor'), markNoticeAsRead);
router.delete('/my-notices/:id', protect, authorize('tutor'), deleteNotice);
router.get('/:id', getTutorById);
router.put('/profile', protect, authorize('tutor'), updateMyProfile);
router.post('/upload-documents', protect, authorize('tutor'), uploadVerificationDocuments);
router.delete('/documents/:docType', protect, authorize('tutor'), deleteVerificationDocument);

export default router;
