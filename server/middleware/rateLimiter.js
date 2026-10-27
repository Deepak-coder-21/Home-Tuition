import rateLimit from 'express-rate-limit';

/**
 * Standard JSON response generator for rate-limit breaches
 */
const createLimiterResponse = (message, retryAfterMinutes) => ({
  success: false,
  message,
  retryAfter: `${retryAfterMinutes} minutes`
});

/**
 * 1. Global API Rate Limiter
 * Applied across all /api routes to prevent DoS attacks and resource exhaustion.
 * Allows up to 300 requests per 15-minute window per IP.
 */
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true, // Return standard RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  message: createLimiterResponse(
    'Too many requests received from your IP address. Please slow down and try again in 15 minutes.',
    15
  ),
  skip: (req) => {
    // Skip health check telemetry from rate limiting
    return req.path === '/api/health';
  }
});

/**
 * 2. Login Rate Limiter
 * Applied to POST /api/auth/login.
 * Protects user accounts against credential stuffing and brute-force password guessing.
 * Allows 10 attempts per 15-minute window per IP.
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 15 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: createLimiterResponse(
    'Too many sign-in attempts from this network. For security reasons, please wait 15 minutes before attempting to log in again.',
    15
  )
});

/**
 * 3. OTP Dispatch Rate Limiter
 * Applied to POST /api/auth/send-registration-otp and POST /api/auth/forgot-password.
 * Protects email service (Brevo) quotas and prevents email bombarding/harassment.
 * Allows maximum 5 OTP dispatch requests per 1-hour window per IP.
 */
export const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: createLimiterResponse(
    'Too many verification code (OTP) requests from this network. To protect email security, please wait 1 hour before requesting another code.',
    60
  )
});

/**
 * 4. OTP Verification Rate Limiter
 * Applied to POST /api/auth/verify-registration-otp and POST /api/auth/verify-reset-otp.
 * Prevents automated brute-force attacks on the 6-digit numeric OTP.
 * Allows maximum 10 verification attempts per 15-minute window per IP.
 */
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: createLimiterResponse(
    'Too many invalid verification code attempts. For your security, this action has been temporarily locked for 15 minutes.',
    15
  )
});

/**
 * 5. Account Registration Limiter
 * Applied to POST /api/auth/register.
 * Prevents malicious automated account creation or bot flooding.
 * Allows maximum 10 registrations per 1-hour window per IP.
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: createLimiterResponse(
    'Too many accounts created from this network. Please wait 1 hour before registering another account.',
    60
  )
});

/**
 * 6. Inquiry Submission Limiter
 * Applied to POST /api/inquiries.
 * Protects educators from being spammed by rapid-fire fake tuition requests.
 * Allows maximum 15 inquiries per 1-hour window per IP.
 */
export const inquiryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: createLimiterResponse(
    'You have reached the maximum number of tuition inquiries allowed per hour. Please wait a short while before sending further inquiries.',
    60
  )
});

/**
 * 7. Review Submission Limiter
 * Applied to POST /api/reviews.
 * Prevents review flooding and reputation distortion.
 * Allows maximum 10 reviews per 1-hour window per IP.
 */
export const reviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: createLimiterResponse(
    'Too many reviews submitted from this network. Please try again in 1 hour.',
    60
  )
});
