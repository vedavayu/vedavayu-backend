const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  },
  url: {
    type: String,
    required: true
  },
  cloudinaryId: {
    type: String  // Store Cloudinary public_id
  },
  cloudinaryUrl: {
    type: String  // Store optimized Cloudinary URL
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Gallery', GallerySchema);