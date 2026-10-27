import User from '../models/User.js';
import TutorProfile from '../models/TutorProfile.js';
import Otp from '../models/Otp.js';
import { generateToken } from '../middleware/authMiddleware.js';
import { sendRegistrationOtpEmail, sendPasswordResetOtpEmail } from '../utils/emailService.js';
import { validateRealEmail } from '../utils/emailValidator.js';
import { validateStrongPassword } from '../utils/passwordValidator.js';
import { getAdminEmail } from '../utils/adminSync.js';

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
      pincode,
      pincodes,
      landmark,
      studentName, 
      studentGrade, 
      board,
      school,
      subjectsNeeded,
      preferredMode,
      learningGoals,
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

    // Robust parsing for pincode / pincodes
    let resolvedPincodes = [];
    if (Array.isArray(pincodes)) {
      resolvedPincodes = pincodes.map(p => String(p).trim()).filter(Boolean);
    } else if (typeof pincodes === 'string' && pincodes.trim()) {
      resolvedPincodes = pincodes.split(',').map(p => p.trim()).filter(Boolean);
    } else if (pincode && String(pincode).trim()) {
      resolvedPincodes = [String(pincode).trim()];
    }

    const resolvedPincode = (pincode && String(pincode).trim()) || resolvedPincodes[0] || '';
    if (resolvedPincode && !resolvedPincodes.includes(resolvedPincode)) {
      resolvedPincodes.unshift(resolvedPincode);
    }

    // Robust date & time capture for policy agreement audit record
    const agreementDateObj = req.body.agreedToPolicyAt ? new Date(req.body.agreedToPolicyAt) : new Date();
    const agreedDate = agreementDateObj.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
    const agreedTime = agreementDateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    });
    const agreedFormatted = `${agreedDate} at ${agreedTime} (IST)`;

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
      pincode: resolvedPincode,
      landmark: landmark?.trim() || '',
      studentName: studentName?.trim() || '',
      studentGrade: studentGrade || '',
      board: board || '',
      school: school?.trim() || '',
      subjectsNeeded: subjectsNeeded?.trim() || '',
      preferredMode: preferredMode || 'home_visit',
      learningGoals: learningGoals?.trim() || '',
      agreedToPolicy: true,
      agreedToPolicyAt: agreementDateObj,
      agreedToPolicyDate: agreedDate,
      agreedToPolicyTime: agreedTime,
      agreedToPolicyFormatted: agreedFormatted
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
          pincodes: resolvedPincodes,
          pincode: resolvedPincode
        },
        pincode: resolvedPincode,
        modes: modes || ['home_visit', 'online'],
        subjects: subjects || ['Mathematics'],
        classes: classes || ['Class 9 - 10 (Secondary)'],
        boards: boards || ['CBSE'],
        rates: {
          monthly: Number(monthlyRate) || (Number(hourlyRate) ? Number(hourlyRate) * 12 : 7500),
          hourly: Number(hourlyRate) || (Number(monthlyRate) ? Math.round(Number(monthlyRate) / 12) : 625)
        },
        bio: bio || 'Committed to personalized 1-on-1 teaching and strong conceptual mastery.',
        isVerified: false, // Needs Admin audit
        agreedToPolicy: true,
        agreedToPolicyAt: agreementDateObj,
        agreedToPolicyDate: agreedDate,
        agreedToPolicyTime: agreedTime,
        agreedToPolicyFormatted: agreedFormatted
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
        phone: user.phone || '',
        state: user.state || '',
        city: user.city || '',
        locality: user.locality || '',
        houseLocation: user.houseLocation || '',
        pincode: user.pincode || '',
        landmark: user.landmark || '',
        studentName: user.studentName || '',
        studentGrade: user.studentGrade || '',
        board: user.board || '',
        school: user.school || '',
        subjectsNeeded: user.subjectsNeeded || '',
        preferredMode: user.preferredMode || 'home_visit',
        learningGoals: user.learningGoals || '',
        agreedToPolicy: user.agreedToPolicy,
        agreedToPolicyAt: user.agreedToPolicyAt,
        agreedToPolicyDate: user.agreedToPolicyDate,
        agreedToPolicyTime: user.agreedToPolicyTime,
        agreedToPolicyFormatted: user.agreedToPolicyFormatted,
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

    const cleanEmail = (typeof email === 'string' ? email : String(email || '')).toLowerCase().trim();
    const cleanPassword = typeof password === 'string' ? password : String(password || '');

    const user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }

    let isMatch = false;
    try {
      isMatch = await user.matchPassword(cleanPassword);
    } catch {
      isMatch = false;
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: `Access denied. Your account is registered as '${user.role}'` });
    }

    let tutorProfileId = null;
    let tutorAvatar = user.avatar || '';
    if (user.role === 'tutor') {
      try {
        const profile = await TutorProfile.findOne({ user: user._id });
        tutorProfileId = profile?._id;
        if (profile?.avatar) {
          tutorAvatar = profile.avatar;
        }
      } catch (err) {
        console.error('Error fetching tutor profile during login:', err.message);
      }
    }

    const token = generateToken(user._id, user.role);

    return res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: tutorAvatar,
        phone: user.phone || '',
        state: user.state || '',
        city: user.city || '',
        locality: user.locality || '',
        houseLocation: user.houseLocation || '',
        pincode: user.pincode || '',
        landmark: user.landmark || '',
        studentName: user.studentName || '',
        studentGrade: user.studentGrade || '',
        board: user.board || '',
        school: user.school || '',
        subjectsNeeded: user.subjectsNeeded || '',
        preferredMode: user.preferredMode || 'home_visit',
        learningGoals: user.learningGoals || '',
        agreedToPolicy: user.agreedToPolicy ?? true,
        agreedToPolicyAt: user.agreedToPolicyAt || null,
        agreedToPolicyDate: user.agreedToPolicyDate || '',
        agreedToPolicyTime: user.agreedToPolicyTime || '',
        agreedToPolicyFormatted: user.agreedToPolicyFormatted || '',
        tutorProfileId
      }
    });
  } catch (error) {
    console.error('loginUser error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to sign in at this time. Please try again shortly.' });
  }
};

/* === [START DEMO LOGIN FEATURE - DELETE THIS BLOCK TO REMOVE DEMO LOGIN] ===
 * Route: POST /api/auth/demo-login
 * If removing demo login in the future, remove this entire block (demoLogin function).
 */
// @desc    One-Click Demo / Visiting Login for Student, Teacher, Admin
// @route   POST /api/auth/demo-login
// @access  Public
export const demoLogin = async (req, res) => {
  try {
    const rawRole = (req.body?.role || 'student').toLowerCase().trim();
    const role = (rawRole === 'teacher' || rawRole === 'tutor') ? 'tutor' : rawRole;

    if (!['student', 'tutor', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid demo role. Allowed roles are: 'student', 'teacher' (or 'tutor'), and 'admin'."
      });
    }

    let userObj = null;
    let tutorProfileId = null;

    if (role === 'student') {
      let existingStudent = await User.findOne({ role: 'student' }).select('-password');
      if (existingStudent) {
        userObj = existingStudent.toObject ? existingStudent.toObject() : { ...existingStudent };
      } else {
        userObj = {
          _id: 'usr-demo-student-1',
          name: 'Aarav Verma',
          role: 'student',
          phone: '+91 98000 00001',
          state: 'Delhi NCR',
          city: 'New Delhi',
          locality: 'Greater Kailash II',
          houseLocation: 'Flat 402, Block B, Silver Oak Apartments',
          studentName: 'Aarav Verma',
          studentGrade: 'Class 10 (Secondary)',
          board: 'CBSE',
          school: 'Delhi Public School',
          subjectsNeeded: 'Mathematics, Science',
          preferredMode: 'home_visit',
          learningGoals: 'Targeting 95%+ in Class 10 CBSE Board Exams',
          agreedToPolicy: true
        };
      }
      // Never expose personal email in demo mode
      userObj.email = 'student.demo@vidyanest.com';
      userObj.isDemo = true;
      if (!userObj.name.includes('(Demo)')) {
        userObj.name = `${userObj.name} (Demo)`;
      }
    } else if (role === 'tutor') {
      let existingTutorUser = await User.findOne({ role: 'tutor' }).select('-password');
      let existingTutorProfile = null;
      if (existingTutorUser) {
        existingTutorProfile = await TutorProfile.findOne({ user: existingTutorUser._id });
      }
      if (!existingTutorProfile) {
        existingTutorProfile = await TutorProfile.findOne();
      }

      if (existingTutorUser) {
        userObj = existingTutorUser.toObject ? existingTutorUser.toObject() : { ...existingTutorUser };
      } else {
        userObj = {
          _id: 'usr-demo-tutor-1',
          name: 'Dr. Rajesh Sharma',
          role: 'tutor',
          phone: '+91 98000 00002',
          state: 'Delhi NCR',
          city: 'New Delhi',
          locality: 'South Extension',
          agreedToPolicy: true
        };
      }
      // Never expose personal email in demo mode
      userObj.email = 'tutor.demo@vidyanest.com';
      userObj.isDemo = true;
      if (!userObj.name.includes('(Demo)')) {
        userObj.name = `${userObj.name} (Demo)`;
      }
      userObj.avatar = existingTutorProfile?.avatar || userObj.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';
      userObj.tutorProfileId = existingTutorProfile?._id || 'demo-profile-1';
      tutorProfileId = userObj.tutorProfileId;
    } else if (role === 'admin') {
      let existingAdmin = await User.findOne({ role: 'admin' }).select('-password');
      if (existingAdmin) {
        userObj = existingAdmin.toObject ? existingAdmin.toObject() : { ...existingAdmin };
      } else {
        userObj = {
          _id: 'usr-admin-1',
          name: 'VidyaNest Administrator',
          role: 'admin',
          city: 'New Delhi'
        };
      }
      // NEVER expose real admin email (e.g. personal Gmail) in demo mode
      userObj.email = 'admin.demo@vidyanest.com';
      userObj.isDemo = true;
      if (!userObj.name.includes('(Demo)')) {
        userObj.name = `${userObj.name} (Demo)`;
      }
    }

    const token = generateToken(userObj._id, role, {
      isDemo: true,
      role,
      name: userObj.name,
      email: userObj.email
    });

    const roleLabel = role === 'tutor' ? 'Teacher / Educator' : role === 'admin' ? 'Administrator' : 'Student / Parent';

    return res.json({
      success: true,
      token,
      isDemo: true,
      message: `Welcome! Logged in as Demo ${roleLabel} for visiting. Changes are not saved in demo login.`,
      user: {
        ...userObj,
        tutorProfileId,
        isDemo: true
      }
    });
  } catch (error) {
    console.error('demoLogin error:', error.message);
    return res.status(500).json({ success: false, message: 'Unable to initiate demo session.' });
  }
};
/* === [END DEMO LOGIN FEATURE - demoLogin] === */

// @desc    Get logged in user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    let user = await User.findById(req.user.id || req.user._id);
    if (!user && (req.isDemo || req.user?.isDemo)) {
      user = req.user;
    }
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

    const userObj = user.toObject ? user.toObject() : { ...user };
    const isDemo = Boolean(req.isDemo || req.user?.isDemo || userObj.isDemo);

    if (isDemo) {
      if (userObj.role === 'admin') userObj.email = 'admin.demo@vidyanest.com';
      else if (userObj.role === 'tutor') userObj.email = 'tutor.demo@vidyanest.com';
      else if (userObj.role === 'student') userObj.email = 'student.demo@vidyanest.com';
    }

    res.json({
      success: true,
      user: {
        ...userObj,
        avatar,
        tutorProfile,
        isDemo
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

// @desc    Update current logged-in user profile (Student/Parent details)
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    /* === [START DEMO LOGIN FEATURE - PROFILE UPDATE SAFEGUARD: Remove lines if disabling demo] === */
    if (req.isDemo || req.user?.isDemo) {
      const current = req.user.toObject ? req.user.toObject() : req.user;
      const simulatedUser = {
        ...current,
        ...req.body,
        isDemo: true
      };
      return res.json({
        success: true,
        isDemo: true,
        message: 'Profile update simulated in Demo Mode: changes are not saved in demo login.',
        user: simulatedUser
      });
    }
    /* === [END DEMO LOGIN FEATURE - PROFILE UPDATE SAFEGUARD] === */

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const allowedUpdates = [
      'name', 'phone', 'state', 'city', 'locality', 'houseLocation',
      'pincode', 'landmark', 'school', 'subjectsNeeded', 'preferredMode', 'learningGoals',
      'studentName', 'studentGrade', 'board', 'avatar'
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    // If user is also a tutor, synchronize name and avatar to TutorProfile
    if (user.role === 'tutor') {
      await TutorProfile.findOneAndUpdate(
        { user: user._id },
        { name: user.name, ...(user.avatar ? { avatar: user.avatar } : {}) }
      );
    }

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone || '',
        state: user.state || '',
        city: user.city || '',
        locality: user.locality || '',
        houseLocation: user.houseLocation || '',
        pincode: user.pincode || '',
        landmark: user.landmark || '',
        studentName: user.studentName || '',
        studentGrade: user.studentGrade || '',
        board: user.board || '',
        school: user.school || '',
        subjectsNeeded: user.subjectsNeeded || '',
        preferredMode: user.preferredMode || 'home_visit',
        learningGoals: user.learningGoals || '',
        agreedToPolicy: user.agreedToPolicy ?? true,
        agreedToPolicyAt: user.agreedToPolicyAt || null,
        agreedToPolicyDate: user.agreedToPolicyDate || '',
        agreedToPolicyTime: user.agreedToPolicyTime || '',
        agreedToPolicyFormatted: user.agreedToPolicyFormatted || ''
      }
    });
  } catch (error) {
    console.error('updateUserProfile error:', error.message);
    res.status(500).json({ success: false, message: 'Unable to update profile.' });
  }
};

