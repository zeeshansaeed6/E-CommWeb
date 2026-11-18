import jwt from 'jsonwebtoken';

/**
 * Generates a JSON Web Token and attaches it as an HTTP-Only secure cookie
 * @param {Object} res - Express Response object
 * @param {string} userId - User MongoDB ObjectId
 * @param {string} role - User role (Admin, Vendor, Customer)
 * @returns {string} token
 */
export const generateToken = (res, userId, role) => {
  const token = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? undefined : 'dev_only_secret'),
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    }
  );

  res.cookie('jwt', token, {
    httpOnly: true, // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // CSRF protection
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });

  return token;
};

/**
 * Clears the JWT cookie on logout
 * @param {Object} res - Express Response object
 */
export const clearTokenCookie = (res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
};
