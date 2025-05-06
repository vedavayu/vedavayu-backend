const express = require('express');
const router = express.Router();
const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');
const About = require('../models/About');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Configure multer for file storage
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '-' + Math.round(Math.random() * 1E9));
  }
});

const upload = multer({ storage: storage });

// GET /api/about - Get about information
router.get('/', async (req, res) => {
  try {
    let aboutInfo = await About.findOne();
    
    // If no about info exists yet, return a default
    if (!aboutInfo) {
      return res.json({
        title: 'About Vedavayu',
        content: 'Welcome to Vedavayu, your trusted healthcare provider.',
        mission: 'To provide accessible healthcare to all',
        vision: 'A world where quality healthcare is available to everyone',
        statistics: {
          doctors: 0,
          therapies: 0
        }
      });
    }
    
    res.json(aboutInfo);
  } catch (err) {
    console.error('Error fetching about info:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/about - Create or update about information (admin only)
router.post('/', [auth, admin, upload.single('journeyImage')], async (req, res) => {
  try {
    // Find if about info already exists
    let aboutInfo = await About.findOne();
    const aboutData = { ...req.body };
    
    // Parse statistics from JSON string if needed
    if (aboutData.statistics && typeof aboutData.statistics === 'string') {
      try {
        aboutData.statistics = JSON.parse(aboutData.statistics);
      } catch (e) {
        console.error('Error parsing statistics JSON:', e);
      }
    }
    
    // Handle image upload to Cloudinary if file is provided
    if (req.file) {
      try {
        console.log('Uploading journey image to Cloudinary...');
        // Upload the file to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'vedavayu/about',
          use_filename: true
        });
        
        // Add the image URL to aboutData
        aboutData.journeyImage = result.secure_url;
        console.log('Image uploaded successfully:', result.secure_url);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Error uploading image' });
      }
    } else if (!aboutData.journeyImage && aboutInfo && aboutInfo.journeyImage) {
      // If no new image is uploaded and no image URL is in the request, 
      // keep the existing journeyImage from the database
      aboutData.journeyImage = aboutInfo.journeyImage;
    }
    
    console.log('About data to be saved:', aboutData);
    
    if (aboutInfo) {
      // Update existing
      aboutInfo = await About.findOneAndUpdate(
        {}, // Update first document found
        { 
          ...aboutData,
          updatedAt: Date.now()
        },
        { new: true }
      );
    } else {
      // Create new
      aboutInfo = new About({
        ...aboutData,
        updatedAt: Date.now()
      });
      await aboutInfo.save();
    }
    
    res.json({ success: true, about: aboutInfo });
  } catch (err) {
    console.error('Error updating about info:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;