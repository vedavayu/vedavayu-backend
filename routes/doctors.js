const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const Doctor = require('../models/Doctor');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('multer');
const { uploadImage, deleteImage, getOptimizedUrl } = require('../config/cloudinary');

// ensure upload directory exists
const uploadPath = path.join(__dirname, '..', 'uploads', 'doctors');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

/**
 * Utility to remove an image file from disk.
 * @param {string} imageUrl e.g. "/uploads/doctors/1234-file.png"
 */
const removeImageFile = (imageUrl) => {
  if (!imageUrl) return;
  // strip leading slash
  const relPath = imageUrl.replace(/^\/+/, '');
  const fullPath = path.join(__dirname, '..', relPath);
  fs.unlink(fullPath, err => {
    if (err && err.code !== 'ENOENT') {
      console.error('Failed to delete image:', fullPath, err);
    }
  });
};

// GET /api/doctors
// Optional query params: ?name=foo&specialty=bar
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.name) {
      filter.name = new RegExp(req.query.name, 'i');
    }
    if (req.query.specialty) {
      filter.specialty = new RegExp(req.query.specialty, 'i');
    }
    const doctors = await Doctor.find(filter).sort({ createdAt: -1 });
    
    // Return in a consistent structure
    res.json({
      success: true,
      doctors: doctors
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// GET /api/doctors/:id
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ 
        success: false,
        message: 'Doctor not found' 
      });
    }
    
    res.json({
      success: true,
      doctor: doctor
    });
  } catch (err) {
    res.status(400).json({ 
      success: false,
      message: 'Invalid ID format' 
    });
  }
});

// POST /api/doctors
router.post('/', [auth, admin, upload.single('image')], async (req, res) => {
  try {
    console.log('Creating doctor with body:', req.body);
    console.log('File received:', req.file ? {
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file uploaded');
    
    const { name, specialty, status = 'active' } = req.body;
    let image = '';
    let cloudinaryId = '';
    let cloudinaryUrl = '';
    
    // Upload to Cloudinary if file exists
    if (req.file) {
      // Get full path to the uploaded file
      const filePath = path.join(req.file.destination, req.file.filename);
      console.log('Uploading to Cloudinary from path:', filePath);
      
      try {
        // Upload to Cloudinary
        const result = await uploadImage(filePath, 'doctors');
        console.log('Cloudinary upload result:', result);
        
        // Set Cloudinary details
        cloudinaryId = result.public_id;
        cloudinaryUrl = result.secure_url;
        image = result.secure_url; // Use Cloudinary URL as primary image
        
        // Remove local file after uploading to Cloudinary
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error removing temp file:', err);
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        // Fallback to local storage if Cloudinary fails
        image = `/uploads/doctors/${req.file.filename}`;
      }
    }
    
    const doctor = new Doctor({ 
      name, 
      specialty,
      status, 
      image, 
      cloudinaryId, 
      cloudinaryUrl 
    });
    
    const savedDoctor = await doctor.save();
    console.log('Doctor saved to database:', savedDoctor);
    
    // Return success response with the doctor data
    res.status(201).json({
      success: true,
      doctor: savedDoctor
    });
  } catch (err) {
    console.error('Error creating doctor:', err);
    res.status(400).json({
      success: false,
      message: 'Invalid doctor data'
    });
  }
});

// PUT /api/doctors/:id
router.put('/:id', [auth, admin, upload.single('image')], async (req, res) => {
  try {
    const { name, specialty, status } = req.body;
    const existing = await Doctor.findById(req.params.id);
    
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Update with new image if provided
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (existing.cloudinaryId) {
        try {
          await deleteImage(existing.cloudinaryId);
        } catch (error) {
          console.error('Error deleting old Cloudinary image:', error);
        }
      }
      
      try {
        // Get full path to the uploaded file
        const filePath = path.join(req.file.destination, req.file.filename);
        
        // Upload new image to Cloudinary
        const result = await uploadImage(filePath, 'doctors');
        
        // Update with new Cloudinary details
        existing.cloudinaryId = result.public_id;
        existing.cloudinaryUrl = result.secure_url;
        existing.image = result.secure_url;
        
        // Remove local file after uploading to Cloudinary
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error removing temp file:', err);
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        // Fallback to local storage if Cloudinary fails
        existing.image = `/uploads/doctors/${req.file.filename}`;
      }
    }

    // Update other fields
    existing.name = name;
    existing.specialty = specialty;
    if (status) existing.status = status;
    
    await existing.save();
    
    res.json({
      success: true,
      doctor: existing
    });
  } catch (err) {
    console.error('Error updating doctor:', err);
    res.status(400).json({
      success: false,
      message: 'Invalid update data'
    });
  }
});

// DELETE /api/doctors/:id
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Delete image from Cloudinary if exists
    if (doctor.cloudinaryId) {
      await deleteImage(doctor.cloudinaryId);
    }

    res.json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting doctor:', err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
