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
import { 
  loginLimiter, 
  otpRequestLimiter, 
  otpVerifyLimiter, 
  registerLimiter 
} from '../middleware/rateLimiter.js';

const router = express.Router();

// Standard Authentication with brute-force / bot protection
router.post('/register', registerLimiter, registerUser);
router.post('/login', loginLimiter, loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);

// Brevo Email OTP Routes for Registration with quota protection
router.post('/send-registration-otp', otpRequestLimiter, sendRegistrationOtp);
router.post('/verify-registration-otp', otpVerifyLimiter, verifyRegistrationOtp);

// Brevo Email OTP Routes for Password Reset
router.post('/forgot-password', otpRequestLimiter, forgotPassword);
router.post('/verify-reset-otp', otpVerifyLimiter, verifyResetOtp);
router.post('/reset-password', otpVerifyLimiter, resetPassword);

export default router;
