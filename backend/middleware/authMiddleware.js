import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect middleware: Ensures the request is authenticated via HTTP-Only JWT cookie
 */
export const protect = async (req, res, next) => {
  let token = req.cookies?.jwt;

  // Fallback to Bearer token header if cookie is absent (useful for API testing/tools)
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no authentication token provided',
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret_multivendor_ecommerce'
    );

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('JWT Verification error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token is invalid or expired',
    });
  }
};

/**
 * RestrictTo middleware: Role-Based Access Control (RBAC)
 * @param  {...string} roles - Permitted roles (e.g. 'Admin', 'Vendor', 'Customer')
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: User role '${req.user ? req.user.role : 'Anonymous'}' is not authorized to access this resource`,
      });
    }
    next();
  };
};
