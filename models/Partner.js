const mongoose = require('mongoose');

const PartnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    required: true
  },
  logoPublicId: {
    type: String,
    default: ''
  },
  ownerPhoto: {
    type: String,
    default: ''
  },
  ownerPhotoPublicId: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: '#'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Partner', PartnerSchema);