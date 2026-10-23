import express from 'express';
import { 
  registerUser, 
  loginUser, 
  getMe,
  sendRegistrationOtp,
  verifyRegistrationOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  updateUserProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Standard Authentication
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);

// Brevo Email OTP Routes for Registration
router.post('/send-registration-otp', sendRegistrationOtp);
router.post('/verify-registration-otp', verifyRegistrationOtp);

// Brevo Email OTP Routes for Password Reset
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);

export default router;
