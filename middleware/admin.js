const jwt = require('jsonwebtoken');
require('dotenv').config();

// Export as a function (not an object with a function property)
const adminMiddleware = function(req, res, next) {
  // Handle case-insensitive header and different formats
  const authHeader = req.header('Authorization') || req.header('authorization');
  const token = authHeader?.replace(/^Bearer\s+/i, '');
  
  if (!token) return res.status(401).json({ message: 'No token found' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user object exists in decoded token
    if (!decoded.user) {
      return res.status(401).json({ message: 'Invalid token structure' });
    }

    // Check if role is admin
    if (decoded.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    
    req.user = decoded.user;
    next();
  } catch (err) {
    console.error('JWT Error:', err.message);
    return res.status(401).json({ 
      message: 'Invalid token',
      error: err.message
    });
  }
};

// Use CommonJS module.exports style
module.exports = adminMiddleware;