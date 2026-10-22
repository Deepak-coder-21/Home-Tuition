import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required for OTP'],
    lowercase: true,
    trim: true,
    index: true
  },
  otp: {
    type: String,
    required: [true, 'OTP code is required']
  },
  purpose: {
    type: String,
    enum: ['registration', 'password_reset'],
    required: [true, 'OTP purpose is required']
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // 10 minutes TTL: MongoDB automatically deletes expired OTPs
  }
});

// Compound index for quick lookups
otpSchema.index({ email: 1, purpose: 1 });

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;
