const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const Partner = require('../models/Partner');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const multer = require('multer');
const { uploadImage, deleteImage } = require('../config/cloudinary');

// ensure upload directory exists
const uploadPath = path.join(__dirname, '..', 'uploads', 'partners');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Get all partners
router.get('/', async (req, res) => {
  try {
    const partners = await Partner.find().sort({ createdAt: -1 });
    res.json(partners);
  } catch (err) {
    console.error('Error fetching partners:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new partner
router.post('/', [auth, admin, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'ownerPhoto', maxCount: 1 }
])], async (req, res) => {
  try {
    const { name, website } = req.body;
    
    // Input validation
    if (!name || !req.files || !req.files.logo) {
      return res.status(400).json({ message: 'Name and logo are required' });
    }
    
    let logo = '';
    let logoPublicId = '';
    let ownerPhoto = '';
    let ownerPhotoPublicId = '';
    
    // Upload logo to Cloudinary
    if (req.files.logo) {
      const logoFile = req.files.logo[0];
      const filePath = path.join(logoFile.destination, logoFile.filename);
      
      try {
        // Upload to Cloudinary
        const result = await uploadImage(filePath, 'partners');
        
        // Set Cloudinary details
        logoPublicId = result.public_id;
        logo = result.secure_url;
        
        // Remove local file after uploading to Cloudinary
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error removing temp file:', err);
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        // Fallback to local storage if Cloudinary fails
        logo = `/uploads/partners/${logoFile.filename}`;
      }
    }

    // Upload owner photo to Cloudinary if provided
    if (req.files.ownerPhoto) {
      const ownerPhotoFile = req.files.ownerPhoto[0];
      const filePath = path.join(ownerPhotoFile.destination, ownerPhotoFile.filename);
      
      try {
        // Upload to Cloudinary
        const result = await uploadImage(filePath, 'partners');
        
        // Set Cloudinary details
        ownerPhotoPublicId = result.public_id;
        ownerPhoto = result.secure_url;
        
        // Remove local file after uploading to Cloudinary
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error removing temp file:', err);
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        // Fallback to local storage if Cloudinary fails
        ownerPhoto = `/uploads/partners/${ownerPhotoFile.filename}`;
      }
    }
    
    const newPartner = new Partner({
      name,
      logo,
      logoPublicId,
      ownerPhoto,
      ownerPhotoPublicId,
      website: website || '#'
    });
    
    await newPartner.save();
    res.status(201).json(newPartner);
  } catch (err) {
    console.error('Error creating partner:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a partner
router.put('/:id', [auth, admin, upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'ownerPhoto', maxCount: 1 }
])], async (req, res) => {
  try {
    const { id } = req.params;
    const { name, website } = req.body;
    
    // Find partner by ID
    const partner = await Partner.findById(id);
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    // Update partner fields if provided
    if (name) partner.name = name;
    if (website) partner.website = website;
    
    // Update logo if provided
    if (req.files && req.files.logo) {
      // Delete old image from Cloudinary if exists
      if (partner.logoPublicId) {
        try {
          await deleteImage(partner.logoPublicId);
        } catch (error) {
          console.error('Error deleting old Cloudinary image:', error);
        }
      }
      
      try {
        const logoFile = req.files.logo[0];
        // Get full path to the uploaded file
        const filePath = path.join(logoFile.destination, logoFile.filename);
        
        // Upload new image to Cloudinary
        const result = await uploadImage(filePath, 'partners');
        
        // Update with new Cloudinary details
        partner.logoPublicId = result.public_id;
        partner.logo = result.secure_url;
        
        // Remove local file after uploading to Cloudinary
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error removing temp file:', err);
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error during update:', cloudinaryError);
        // Fallback to local storage if Cloudinary fails
        const logoFile = req.files.logo[0];
        partner.logo = `/uploads/partners/${logoFile.filename}`;
        partner.logoPublicId = ''; // Clear the public ID since we're now using local storage
      }
    }

    // Update owner photo if provided
    if (req.files && req.files.ownerPhoto) {
      // Delete old image from Cloudinary if exists
      if (partner.ownerPhotoPublicId) {
        try {
          await deleteImage(partner.ownerPhotoPublicId);
        } catch (error) {
          console.error('Error deleting old Cloudinary image:', error);
        }
      }
      
      try {
        const ownerPhotoFile = req.files.ownerPhoto[0];
        // Get full path to the uploaded file
        const filePath = path.join(ownerPhotoFile.destination, ownerPhotoFile.filename);
        
        // Upload new image to Cloudinary
        const result = await uploadImage(filePath, 'partners');
        
        // Update with new Cloudinary details
        partner.ownerPhotoPublicId = result.public_id;
        partner.ownerPhoto = result.secure_url;
        
        // Remove local file after uploading to Cloudinary
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error removing temp file:', err);
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error during update:', cloudinaryError);
        // Fallback to local storage if Cloudinary fails
        const ownerPhotoFile = req.files.ownerPhoto[0];
        partner.ownerPhoto = `/uploads/partners/${ownerPhotoFile.filename}`;
        partner.ownerPhotoPublicId = ''; // Clear the public ID since we're now using local storage
      }
    }
    
    // Save the updated partner
    const updatedPartner = await partner.save();
    res.json(updatedPartner);
  } catch (err) {
    console.error('Error updating partner:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a partner
router.delete('/:id', [auth, admin], async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find partner by ID
    const partner = await Partner.findById(id);
    
    if (!partner) {
      return res.status(404).json({ message: 'Partner not found' });
    }
    
    // Delete logo from Cloudinary if exists
    if (partner.logoPublicId) {
      try {
        await deleteImage(partner.logoPublicId);
      } catch (error) {
        console.error('Error deleting Cloudinary image:', error);
      }
    }

    // Delete owner photo from Cloudinary if exists
    if (partner.ownerPhotoPublicId) {
      try {
        await deleteImage(partner.ownerPhotoPublicId);
      } catch (error) {
        console.error('Error deleting Cloudinary image:', error);
      }
    }
    
    // Delete partner from database
    await Partner.findByIdAndDelete(id);
    
    res.json({ message: 'Partner deleted successfully' });
  } catch (err) {
    console.error('Error deleting partner:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;