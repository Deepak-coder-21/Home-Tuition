import User from '../models/User.js';
import TutorProfile from '../models/TutorProfile.js';
import Otp from '../models/Otp.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { sendRegistrationOtpEmail, sendPasswordResetOtpEmail } from '../utils/emailService.js';
import { validateRealEmail } from '../utils/emailValidator.js';
import { validateStrongPassword } from '../utils/passwordValidator.js';

// Helper to generate secure 6-digit numeric OTP
const generateOtpCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Send Email OTP for New User Registration
// @route   POST /api/auth/send-registration-otp
// @access  Public
export const sendRegistrationOtp = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    // Comprehensive real vs fake/disposable email verification
    const emailValidation = await validateRealEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ success: false, message: emailValidation.message });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account is already registered with this email. Please log in.' });
    }

    const otp = generateOtpCode();

    // Store/Update OTP for this email
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'registration' });
    await Otp.create({
      email: normalizedEmail,
      otp,
      purpose: 'registration',
      verified: false
    });

    // Send email via Brevo
    await sendRegistrationOtpEmail({ email: normalizedEmail, name, otp });

    res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}`
    });
  } catch (error) {
    console.error('sendRegistrationOtp error:', error.message);
    res.status(500).json({ success: false, message: 'Unable to send verification code. Please try again shortly.' });
  }
};

// @desc    Verify Registration OTP
// @route   POST /api/auth/verify-registration-otp
// @access  Public
export const verifyRegistrationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: 'registration' });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Verification code not found or expired. Please click "Send OTP" again.' });
    }

    if (otpRecord.otp !== otp.trim()) {
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check your email and try again.' });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    res.json({
      success: true,
      message: 'Email verified successfully.'
    });
  } catch (error) {
    console.error('verifyRegistrationOtp error:', error.message);
    res.status(500).json({ success: false, message: 'Verification service is temporarily unavailable. Please try again.' });
  }
};

// @desc    Register a new user (Student/Parent or Tutor) with Mandatory OTP
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      otp, // MANDATORY: Without OTP no user register
      role, 
      phone, 
      state,
      city, 
      locality, 
      houseLocation,
      studentName, 
      studentGrade, 
      board,
      agreedToPolicy, // MANDATORY: User must agree to website policies
      // Tutor specific fields
      tagline,
      qualification,
      experienceYears,
      localities,
      subjects,
      classes,
      boards,
      modes,
      hourlyRate,
      monthlyRate,
      bio
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // 1. MANDATORY POLICY AGREEMENT ENFORCEMENT
    if (agreedToPolicy !== true && agreedToPolicy !== 'true') {
      return res.status(400).json({ 
        message: 'You must review and agree to the VidyaNest Terms of Service, Responsibility Policy, and Safety Guidelines to register an account.' 
      });
    }

    // 2. REAL EMAIL VERIFICATION (Syntax, Disposable Domain Blocklist & DNS MX Check)
    const emailValidation = await validateRealEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    // 3. STRONG PASSWORD ENFORCEMENT (Min 8 chars, Upper, Lower, Number, Special Char, Common Blacklist)
    const passwordValidation = validateStrongPassword(password, email);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: passwordValidation.message,
        requirements: passwordValidation.requirements
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // STRICT OTP VERIFICATION
    if (!otp || typeof otp !== 'string' || otp.trim().length === 0) {
      return res.status(400).json({ 
        message: 'Email verification code (OTP) is required. Please verify your email before registering.' 
      });
    }

    const otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: 'registration' });
    if (!otpRecord) {
      return res.status(400).json({ 
        message: 'No verification code found or OTP expired. Please click "Send OTP" to verify your email.' 
      });
    }

    if (otpRecord.otp !== otp.trim()) {
      return res.status(400).json({ 
        message: 'Invalid verification code. Please enter the correct OTP sent to your email.' 
      });
    }

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists. Please log in.' });
    }

    // 1. Create Base User
    const user = await User.create({
      name: name?.trim() || 'VidyaNest User',
      email: normalizedEmail,
      password,
      role: role || 'student',
      phone: phone?.trim() || '',
      state: state || '',
      city: city || '',
      locality: locality || '',
      houseLocation: houseLocation?.trim() || '',
      studentName: studentName?.trim() || '',
      studentGrade: studentGrade || '',
      board: board || '',
      agreedToPolicy: true,
      agreedToPolicyAt: new Date()
    });

    let tutorProfile = null;

    // 2. If registering as Tutor, create their TutorProfile
    if (user.role === 'tutor') {
      tutorProfile = await TutorProfile.create({
        user: user._id,
        name: user.name,
        tagline: tagline || `${qualification || 'Certified'} Educator`,
        qualification: qualification || 'Graduate / Educator',
        experienceYears: Number(experienceYears) || 3,
        location: {
          state: state || 'Delhi NCR',
          city: city || 'New Delhi',
          localities: Array.isArray(localities) ? localities : (localities ? localities.split(',').map(s => s.trim()) : [locality || 'Main']),
          pincodes: []
        },
        modes: modes || ['home_visit', 'online'],
        subjects: subjects || ['Mathematics'],
        classes: classes || ['Class 9 - 10 (Secondary)'],
        boards: boards || ['CBSE'],
        rates: {
          monthly: Number(monthlyRate) || (Number(hourlyRate) ? Number(hourlyRate) * 12 : 7500),
          hourly: Number(hourlyRate) || (Number(monthlyRate) ? Math.round(Number(monthlyRate) / 12) : 625)
        },
        bio: bio || 'Committed to personalized 1-on-1 teaching and strong conceptual mastery.',
        isVerified: false // Needs Admin audit
      });
    }

    // 3. Delete used OTP records
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'registration' });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || (user.role === 'tutor' ? tutorProfile?.avatar : '') || '',
        phone: user.phone,
        state: user.state,
        city: user.city,
        locality: user.locality,
        houseLocation: user.houseLocation,
        studentName: user.studentName,
        studentGrade: user.studentGrade,
        tutorProfileId: tutorProfile?._id
      }
    });
  } catch (error) {
    console.error('registerUser error:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists. Please log in.' });
    }
    res.status(500).json({ success: false, message: 'Registration could not be completed at this time. Please try again shortly.' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    // Strictly match password against MongoDB bcrypt hash - NO hardcoded passwords
    const isMatch = await user?.matchPassword(password);

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: `Access denied. Your account is registered as '${user.role}'` });
    }

    let tutorProfileId = null;
    let tutorAvatar = user.avatar || '';
    if (user.role === 'tutor') {
      const profile = await TutorProfile.findOne({ user: user._id }) || (user.email ? await TutorProfile.findOne({ email: user.email }) : null);
      tutorProfileId = profile?._id;
      if (profile?.avatar) {
        tutorAvatar = profile.avatar;
      }
    }

    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: tutorAvatar,
        phone: user.phone || '',
        city: user.city,
        locality: user.locality,
        studentName: user.studentName,
        studentGrade: user.studentGrade,
        tutorProfileId
      }
    });
  } catch (error) {
    console.error('loginUser error:', error.message);
    res.status(500).json({ success: false, message: 'Unable to sign in at this time. Please try again shortly.' });
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    let tutorProfile = null;
    let avatar = user.avatar || '';
    if (user.role === 'tutor') {
      tutorProfile = await TutorProfile.findOne({ user: user._id }) || (user.email ? await TutorProfile.findOne({ email: user.email }) : null);
      if (tutorProfile?.avatar) {
        avatar = tutorProfile.avatar;
      }
    }

    const userObj = user.toObject();

    res.json({
      success: true,
      user: {
        ...userObj,
        avatar,
        tutorProfile
      }
    });
  } catch (error) {
    console.error('getMe error:', error.message);
    res.status(500).json({ success: false, message: 'Unable to retrieve user profile.' });
  }
};

// @desc    Initiate Password Reset (Send OTP via Brevo)
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid registered email address.' });
    }

    const emailValidation = await validateRealEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ success: false, message: emailValidation.message });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No VidyaNest account is registered with this email address.' 
      });
    }

    const otp = generateOtpCode();

    // Store/Update OTP for password reset
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'password_reset' });
    await Otp.create({
      email: normalizedEmail,
      otp,
      purpose: 'password_reset',
      verified: false
    });

    // Send email via Brevo
    await sendPasswordResetOtpEmail({ email: normalizedEmail, name: user.name, otp });

    res.json({
      success: true,
      message: `A 6-digit password reset code has been sent to ${normalizedEmail}`
    });
  } catch (error) {
    console.error('forgotPassword error:', error.message);
    res.status(500).json({ success: false, message: 'Unable to send password reset code. Please try again shortly.' });
  }
};

// @desc    Verify Password Reset OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: 'password_reset' });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reset code not found or expired. Please request a new code.' 
      });
    }

    if (otpRecord.otp !== otp.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Incorrect verification code. Please check your email and try again.' 
      });
    }

    otpRecord.verified = true;
    await otpRecord.save();

    res.json({
      success: true,
      message: 'Verification successful. You can now set a new password.'
    });
  } catch (error) {
    console.error('verifyResetOtp error:', error.message);
    res.status(500).json({ success: false, message: 'Verification service is temporarily unavailable. Please try again.' });
  }
};

// @desc    Reset Password with Mandatory OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, verification OTP, and new password are required.' 
      });
    }

    // STRICT STRONG PASSWORD VALIDATION
    const passwordValidation = validateStrongPassword(newPassword, email);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        success: false, 
        message: passwordValidation.message,
        requirements: passwordValidation.requirements
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // STRICT OTP ENFORCEMENT: Without OTP no user can reset password!
    const otpRecord = await Otp.findOne({ email: normalizedEmail, purpose: 'password_reset' });

    if (!otpRecord) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification code not found or expired. Password cannot be reset without valid OTP.' 
      });
    }

    if (otpRecord.otp !== otp.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification code. Password cannot be reset without valid OTP.' 
      });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    // Set new password (pre-save hook will hash with bcrypt)
    user.password = newPassword;
    await user.save();

    // Clean up used OTP
    await Otp.deleteMany({ email: normalizedEmail, purpose: 'password_reset' });

    res.json({
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('resetPassword error:', error.message);
    res.status(500).json({ success: false, message: 'Unable to reset password at this time. Please try again shortly.' });
  }
};
