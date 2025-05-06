const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Gallery = require('../models/Gallery');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { uploadImage, deleteImage, getOptimizedUrl } = require('../config/cloudinary');

// Configure storage for gallery images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/gallery');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'gallery-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Images only!'));
    }
  }
});

// Helper function to remove image file
const removeImageFile = (imagePath) => {
  try {
    const fullPath = path.join(__dirname, '..', imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.error('Error removing file:', err);
  }
};

// Get all gallery images
router.get('/', async (req, res) => {
  try {
    const images = await Gallery.find().sort({ createdAt: -1 });
    
    // Return in a consistent structure
    res.json({
      success: true,
      gallery: images
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Upload new image
router.post('/', [auth, admin, upload.single('image')], async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No image provided' 
      });
    }
    
    // Upload to Cloudinary
    const result = await uploadImage(req.file.path, 'gallery');
    
    // Create new gallery image with Cloudinary info
    const image = new Gallery({
      title: req.body.title || '',
      description: req.body.description || '',
      url: result.secure_url,  // Cloudinary URL
      cloudinaryId: result.public_id,
      cloudinaryUrl: result.secure_url
    });
    
    await image.save();
    
    // Remove local file after uploading to Cloudinary
    removeImageFile(req.file.path);
    
    res.status(201).json({
      success: true,
      image: image
    });
  } catch (err) {
    console.error('Error uploading gallery image:', err);
    res.status(400).json({ 
      success: false,
      message: err.message || 'Error uploading image' 
    });
  }
});

// Delete gallery image
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ 
        success: false,
        message: 'Image not found' 
      });
    }
    
    // Delete image from Cloudinary if exists
    if (image.cloudinaryId) {
      await deleteImage(image.cloudinaryId);
    }
    
    await Gallery.findByIdAndDelete(req.params.id);
    
    res.json({ 
      success: true,
      message: 'Image deleted successfully' 
    });
  } catch (err) {
    console.error('Error deleting gallery image:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

module.exports = router;