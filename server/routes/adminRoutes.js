import express from 'express';
import { 
  getVerificationQueue, 
  verifyTutorStatus, 
  getAdminStats,
  triggerDocumentReminders,
  getDocumentReminderStatus,
  cleanNoticeMemoryAdmin,
  getStudents,
  toggleBlockUser,
  deleteUser
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/verification-queue', getVerificationQueue);
router.put('/tutors/:id/verify', verifyTutorStatus);
router.get('/stats', getAdminStats);
router.get('/document-reminder-status', getDocumentReminderStatus);
router.post('/trigger-document-reminders', triggerDocumentReminders);
router.post('/clean-notice-memory', cleanNoticeMemoryAdmin);
router.get('/students', getStudents);
router.put('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', deleteUser);

export default router;
