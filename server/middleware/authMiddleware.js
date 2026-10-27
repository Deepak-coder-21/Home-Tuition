import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { getAdminEmail } from '../utils/adminSync.js';

// Helper to generate signed JWT token
export const generateToken = (id, role, extra = {}) => {
  return jwt.sign({ id, role, ...extra }, process.env.JWT_SECRET || 'vidyanest_default_secret_key', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d'
  });
};

// Protect route middleware
export const protect = async (req, res, next) => {
  let token;
  const configuredAdminEmail = getAdminEmail();

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Direct admin bypass token
      if (token === 'admin_bypass_token' || req.headers['x-admin-role'] === 'admin') {
        const adminInDb = await User.findOne({ role: 'admin' }).select('-password');
        req.user = adminInDb || {
          _id: 'usr-admin-1',
          name: 'VidyaNest Administrator',
          email: configuredAdminEmail,
          role: 'admin'
        };
        req.isDemo = false;
        return next();
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vidyanest_default_secret_key');
      const isDemo = Boolean(decoded.isDemo || req.headers['x-demo-session'] === 'true');
      req.isDemo = isDemo;
      
      try {
        req.user = await User.findById(decoded.id).select('-password');
      } catch {
        req.user = null;
      }
      
      // Fallback if token is demo user or decoded info
      if (!req.user && isDemo) {
        req.user = {
          _id: decoded.id || 'usr-demo-1',
          name: decoded.name || `Demo ${decoded.role || 'User'}`,
          email: decoded.email || `demo.${decoded.role || 'user'}@vidyanest.com`,
          role: decoded.role || 'student',
          isDemo: true
        };
      }

      // Fallback if token is admin role or demo admin
      if (!req.user && (decoded.role === 'admin' || decoded.id === 'usr-admin-1')) {
        const adminInDb = await User.findOne({ role: 'admin' }).select('-password');
        req.user = adminInDb || {
          _id: 'usr-admin-1',
          name: 'VidyaNest Administrator',
          email: configuredAdminEmail,
          role: 'admin'
        };
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      /* === [START DEMO LOGIN FEATURE - PROTECT MIDDLEWARE DEMO HANDLING] === */
      if (isDemo || req.user.isDemo) {
        req.isDemo = true;
        req.user.isDemo = true;
        if (req.user.role === 'admin') {
          req.user.email = 'admin.demo@vidyanest.com';
        } else if (req.user.role === 'tutor') {
          req.user.email = 'tutor.demo@vidyanest.com';
        } else if (req.user.role === 'student') {
          req.user.email = 'student.demo@vidyanest.com';
        }
      }
      /* === [END DEMO LOGIN FEATURE - PROTECT MIDDLEWARE DEMO HANDLING] === */

      return next();
    } catch (error) {
      if (req.headers['x-admin-role'] === 'admin') {
        const adminInDb = await User.findOne({ role: 'admin' }).select('-password');
        req.user = adminInDb || {
          _id: 'usr-admin-1',
          name: 'VidyaNest Administrator',
          email: configuredAdminEmail,
          role: 'admin'
        };
        return next();
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // Allow admin header bypass for development / demo admin session
  if (req.headers['x-admin-role'] === 'admin') {
    const adminInDb = await User.findOne({ role: 'admin' }).select('-password');
    req.user = adminInDb || {
      _id: 'usr-admin-1',
      name: 'VidyaNest Administrator',
      email: configuredAdminEmail,
      role: 'admin'
    };
    return next();
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no bearer token provided' });
  }
};

// Role authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user?.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

// Optional auth middleware (attaches req.user if valid token provided, but doesn't block if guest)
export const optionalProtect = async (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vidyanest_default_secret_key');
      const isDemo = Boolean(decoded.isDemo || req.headers['x-demo-session'] === 'true');
      req.isDemo = isDemo;
      
      try {
        req.user = await User.findById(decoded.id).select('-password');
      } catch {
        req.user = null;
      }

      if (!req.user && isDemo) {
        req.user = {
          _id: decoded.id || 'usr-demo-1',
          name: decoded.name || `Demo ${decoded.role || 'User'}`,
          email: decoded.email || `demo.${decoded.role || 'user'}@vidyanest.com`,
          role: decoded.role || 'student',
          isDemo: true
        };
      }

      if (req.user && isDemo) {
        req.user.isDemo = true;
        if (req.user.role === 'admin') {
          req.user.email = 'admin.demo@vidyanest.com';
        } else if (req.user.role === 'tutor') {
          req.user.email = 'tutor.demo@vidyanest.com';
        } else if (req.user.role === 'student') {
          req.user.email = 'student.demo@vidyanest.com';
        }
      }
    } catch (error) {
      // Continue unauthenticated if token is invalid or expired
      req.user = null;
    }
  }
  next();
};

