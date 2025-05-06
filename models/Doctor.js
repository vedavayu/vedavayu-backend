const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  image: { type: String },
  cloudinaryId: { type: String }, // Store Cloudinary public_id
  cloudinaryUrl: { type: String }, // Store optimized Cloudinary URL
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doctor', DoctorSchema);
