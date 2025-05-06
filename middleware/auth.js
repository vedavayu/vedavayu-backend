const jwt = require('jsonwebtoken');
require('dotenv').config();

// Define public routes that don't require authentication
const publicRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/signup',
  '/api/banners',
  '/api/services',
  '/api/doctors'
];

// Export as a function (not an object with a function property)
const authMiddleware = function(req, res, next) {
  // Allow access to public routes without authentication
  if (publicRoutes.some(route => req.path.startsWith(route)) && req.method === 'GET') {
    return next();
  }
  
  // Existing auth logic for protected routes
  const authHeader = req.header('Authorization') || req.header('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');
  
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // Make sure to access user from decoded payload
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Use CommonJS module.exports style
module.exports = authMiddleware;