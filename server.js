const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const path = require('path');
const { error } = require('console');
require('dotenv').config();

const app = express();

// Connect to MongoDB
(async () => {
  try {
    await connectDB();
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
  }
})();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files - order matters!
app.use(express.static(path.join(__dirname, 'public'))); // Serve from public directory first
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Then check uploads directory

// Safely register routes - wrap in try/catch to identify problematic routes
try {
  // API routes
  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/users', require('./routes/users'));
  app.use('/api/doctors', require('./routes/doctors'));
  app.use('/api/services', require('./routes/services'));
  app.use('/api/banners', require('./routes/banners'));
  app.use('/api/gallery', require('./routes/gallery'));
  app.use('/api/partners', require('./routes/partners'));
  app.use('/api/statistics', require('./routes/statistics'));
  app.use('/api/about', require('./routes/about')); // Added missing about route
} catch (err) {
  console.error('Route registration error:', err);
  console.error('Error details:', err.stack);
  process.exit(1);
}

// Fix for redirects to avoid URLs as route paths
app.use((req, res, next) => {
  // Override res.redirect to ensure URLs aren't used as route paths
  const originalRedirect = res.redirect;
  res.redirect = function(url) {
    // If URL starts with http:// or https://, use it directly
    // Otherwise, treat it as a relative path
    if (url && typeof url === 'string' && url.match(/^https?:\/\//)) {
      return originalRedirect.call(this, url);
    }
    return originalRedirect.apply(this, arguments);
  };
  next();
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Server error',
    ...(process.env.NODE_ENV !== 'production' && { error: err.message })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Test route
app.get('/', (req, res) => {
  res.send({
    activeStatus: true,
    error: false,
    message: 'API is running',
  });
});